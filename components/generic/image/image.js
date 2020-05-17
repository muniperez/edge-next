import { useState } from 'react'
import ProgressiveImage from './progressive-image'
export default function ({ srcs = [], width = 240, height = 240 }) {
  const isMultiple = srcs.length > 1
  const [position, setPosition] = useState(0)

  const onClickLeft = () => {
    if (position === 0) {
      setPosition(srcs.length - 1)
    } else {
      setPosition(position - 1)
    }
  }

  const onClickRight = () => {
    if (position === srcs.length - 1) {
      setPosition(0)
    } else {
      setPosition(position + 1)
    }
  }

  const hasQuotes = srcs.reduce(
    (prev, next) => prev || typeof next !== 'string',
    false
  )

  const imageHeight = height
  const totalHeight = hasQuotes ? height + 30 : height
  const itemWidth = 100 / srcs.length

  return (
    <>
      <div
        className={`image-wrapper ${isMultiple ? 'multiple' : ''}`}
        style={{
          maxWidth: '100%',
          width: width + 'px',
          maxHeight: `${totalHeight}px`,
        }}
      >
        {isMultiple && (
          <div onClick={onClickLeft} className="arrow arrow-left">
            left
          </div>
        )}
        <div
          className={`image-container`}
          style={{
            left: `-${100 * position}%`,
            width: `${srcs.length * 100}%`,
          }}
        >
          {srcs.map((s) => {
            const onlySrc = typeof s === 'string'
            return (
              <div
                className={`image-item ${
                  !onlySrc && s.quote ? 'with-quote' : ''
                }`}
                style={{ width: `${itemWidth}%` }}
              >
                <ProgressiveImage
                  alt={!onlySrc ? s.alt || s.quote : s}
                  src={!onlySrc ? s.url : s}
                  key={!onlySrc ? s.url : s}
                  height={imageHeight}
                />
                {!onlySrc && s.quote && <div className="quote">{s.quote}</div>}
              </div>
            )
          })}
        </div>
        {isMultiple && (
          <div onClick={onClickRight} className="arrow arrow-right">
            right
          </div>
        )}
      </div>

      <style jsx>{`
        .image-wrapper {
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .arrow {
          background: var(--empz-background);
          color: var(--empz-foreground);
          cursor: pointer;
          height: 32px;
          overflow: hidden;
          padding: 5px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          text-indent: -9999px;
          width: 32px;
          z-index: 10;
        }

        .arrow:before{
          border-bottom: 2px solid var(--empz-foreground);
          border-right: 2px solid var(--empz-foreground);
          content: '';
          height: 11px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          width: 11px;
        }

        .arrow-left {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          left: 0;
        }
        
        .arrow-left:before{
          transform: translate(-50%,-50%) rotate(135deg);
        }

        .arrow-right {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          right: 0;
        }
        
        .arrow-right:before{
          transform: translate(-50%,-50%) rotate(-45deg);
        }

        .image-container {
          position: relative;
          display: flex;
          transition: left 300ms linear;
        }
        .image-item {
        }

        .quote {
          text-align: center;
          font-size: 13px;
        }
      `}</style>
    </>
  )
}
