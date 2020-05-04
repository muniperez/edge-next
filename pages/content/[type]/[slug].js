import API from '../../../lib/api/api-endpoints'
import ContentDetailView from '../../../components/content/read-content/content-detail-view/content-detail-view'
import Layout from '../../../components/layout/normal/layout'
import { connect } from '../../../lib/api/db'
import fetch from '../../../lib/fetcher'
import { findOneContent } from '../../../lib/api/content/content'
import { getContentTypeDefinition } from '../../../lib/config'
import { hasPermissionsForContent } from '../../../lib/api/middlewares'
import runMiddleware from '../../../lib/api/api-helpers/run-middleware'
import { usePermission } from '../../../lib/hooks'
import useSWR from 'swr'

// Get serversideProps is important for SEO, and only available at the pages level
export async function getServerSideProps({ req, res, query }) {
  const contentTypeDefinition = getContentTypeDefinition(query.type)

  if (!contentTypeDefinition) {
    res.writeHead(302, { Location: '/404' })
    res.end()
    return
  }
  
  await connect()
  const item = await findOneContent(query.type, {
    slug: query.slug,
  })

  try {
    await runMiddleware(req, res, hasPermissionsForContent(query.type, item))
  } catch (e) {
    // User can not access
    return {
      props: {
        data: null,
        type: query.type,
        slug: query.slug,
        canAccess: false,
        pageTitle: 'Not found'
      },
    }
  }

  const contentTitle = item && contentTypeDefinition.publishing.title ? 
    item[contentTypeDefinition.publishing.title] : `${contentTypeDefinition.title.en} detail`

  return {
    props: {
      data: item,
      type: query.type,
      slug: query.slug,
      canAccess: true,
      pageTitle: contentTitle,
      user: req.user || {},
    },
  }
}

function LoadingView() {
  return <h1>Loading...</h1>
}

// TODO: redirect to 404 if not found

const ContentPage = (props) => {
  const contentType = getContentTypeDefinition(props.type)

  usePermission([`content.${props.type}.read`, `content.${props.type}.admin`], '/')

  // Load data
  const { data } = useSWR(API.content[props.type] + '/' + props.slug, fetch, {
    initialData: props.data,
  })

  return (
    <Layout title={props.pageTitle}>
      {!props.canAccess && <LoadingView />}
      {props.canAccess && !props.data && (
        <div className="nothing">Not found</div>
      )}
      {props.canAccess && props.data && (
        <ContentDetailView type={contentType} content={data} />
      )}
    </Layout>
  )
}

export default ContentPage
