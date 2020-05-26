import { useEffect, useRef } from 'react'
import useSWR, { useSWRPages } from 'swr'
import Link from 'next/link'
import API from '@lib/api/api-endpoints'
import Button from '../../../generic/button/button'
import ContentDetailView from '../content-detail-view/content-detail-view'
import fetch from '@lib/fetcher'
import { useOnScreen } from '@lib/client/hooks'
import Placeholder from '../../../generic/loading/loading-placeholder/loading-placeholder'

function LoadingItems() {
  return (
    <>
      <div className="placeholders">
        <div className="p">
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
        </div>
        <div className="p">
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
          <div className="r">
            <Placeholder width={'100%'} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .p {
          background: var(--edge-background);
          padding: var(--edge-gap);
          margin-bottom: var(--edge-gap);
          border-radius: var(--edge-radius);
        }
        .r {
          margin-bottom: var(--edge-gap);
        }
      `}</style>
    </>
  )
}

function EmptyComponent() {
  return <div className="empty">Nothing found</div>
}

export default function (props) {
  const infiniteScroll = props.infiniteScroll
  const query = props.query
  const identificator = 'content-list-' + props.type.slug + '-' + query

  // Fetch content type page by page
  const {
    pages,
    isLoadingMore,
    loadMore,
    isEmpty,
    isReachingEnd,
  } = useSWRPages(
    identificator,
    ({ offset, withSWR }) => {
      const apiUrl = `${API.content[props.type.slug]}?limit=10${
        offset ? '&from=' + offset : ''
      }${query ? `&${query}` : ''}`

      const { data } = withSWR(
        useSWR(
          apiUrl,
          fetch,
          !offset ? { initialData: props.initialData } : null
        )
      )

      if (!data) return <LoadingItems />

      const { results = [] } = data
      return results.map((item) => {
        return (
          <article className="edge-item-card" key={item.id + item.createdAt}>
            <ContentDetailView
              content={item}
              type={props.type}
              summary={true}
              showActions={false}
              showComments={false}
            />

            <style jsx>{`
              .edge-item-card {
                background-color: var(--edge-background);
                border-radius: var(--edge-gap);
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                margin-bottom: var(--edge-gap);
                padding: var(--edge-gap-medium);
                position: relative;
              }
              @media all and (max-width: 720px) {
                .edge-item-card {
                  padding: var(--edge-gap);
                }

                .edge-item-card-stats-item {
                  display: flex;
                  flex-flow: column;
                  font-size: 12px;
                }
              }
            `}</style>
          </article>
        )
      })
    },
    (SWR) => {
      // Calculates the next page offset
      const nextOffset =
        SWR.data && SWR.data.results && SWR.data.results.length >= 10
          ? SWR.data.from * 1 + SWR.data.limit * 1
          : null

      return nextOffset
    },
    []
  )

  const $loadMoreButton = useRef(null)
  const isOnScreen = useOnScreen($loadMoreButton, '200px')

  useEffect(() => {
    if (isOnScreen && infiniteScroll && !isLoadingMore) loadMore()
  }, [isOnScreen])

  return (
    <>
      <div className="contentListView">
        {pages}
        {isLoadingMore && <LoadingItems />}
        {isEmpty && <EmptyComponent />}
        <div className="load-more">
          {isReachingEnd ? null : (
            <Button
              reference={$loadMoreButton}
              loading={isLoadingMore}
              big={true}
              fullWidth={true}
              onClick={loadMore}
            >
              Load More
            </Button>
          )}
        </div>
      </div>
      <style jsx>{`
        .content-summary-wrapper {
          margin-bottom: var(--edge-gap-double);
          border-bottom: var(--light-border);
          padding-bottom: var(--edge-gap-double);
        }

        .load-more {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </>
  )
}
