import React from 'react'

import type { CaseStudy } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'

type ArticleBodyProps = {
  post: CaseStudy
}

/** Case-study article: title, project facts, hero media and the block content. */
export default function ArticleBody({ post }: ArticleBodyProps) {
  const hero = mediaInfo(post.mainMedia)
  const tags = (post.tags ?? []).filter(
    (t): t is Exclude<typeof t, string> => typeof t !== 'string',
  )
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article>
      <header className="post-hero container">
        <p className="eyebrow">{post.year || published || 'Work'}</p>
        <h1>{post.title}</h1>

        <dl className="post-info">
          {post.roles && (
            <div>
              <dt>Role / Services</dt>
              <dd>{post.roles}</dd>
            </div>
          )}
          {post.location && (
            <div>
              <dt>Location</dt>
              <dd>{post.location}</dd>
            </div>
          )}
          {post.year && (
            <div>
              <dt>Year</dt>
              <dd>{post.year}</dd>
            </div>
          )}
          {post.collaborators && post.collaborators.length > 0 && (
            <div>
              <dt>Credits</dt>
              <dd>
                {post.collaborators.map((c) => (
                  <div key={c.id ?? `${c.role}-${c.name}`}>
                    {c.role} — {c.name}
                  </div>
                ))}
              </dd>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <dt>Topics</dt>
              <dd>
                <span className="tag-row">
                  {tags.map((tag) => (
                    <span className="tag" key={tag.id}>
                      {tag.name}
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {hero && (
        <div className="container">
          <Media
            src={hero.url}
            srcSet={hero.srcSet}
            sizes="100vw"
            alt={hero.alt || post.title}
            mimeType={hero.mime}
            width={hero.width}
            height={hero.height}
            loading="eager"
          />
        </div>
      )}

      <div className="post-body container">
        {post.content?.map((block) => {
          if (block.blockType === 'text') {
            return (
              <div key={block.id ?? block.description.slice(0, 24)} className="text-block">
                <p>{block.description}</p>
              </div>
            )
          }

          const media = mediaInfo(block.media)
          if (!media) return null
          return (
            <figure key={block.id ?? media.url} className="media-block">
              <Media
                src={media.url}
                srcSet={media.srcSet}
                sizes="100vw"
                alt={media.alt || block.caption || post.title}
                mimeType={media.mime}
                width={media.width}
                height={media.height}
              />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          )
        })}
      </div>
    </article>
  )
}
