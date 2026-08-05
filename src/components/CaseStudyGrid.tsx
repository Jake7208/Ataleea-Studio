import Link from 'next/link'
import React from 'react'

import type { CaseStudy } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'
import { ArrowRight } from '@/components/icons'

/** Only the fields the grid renders — lets pages query with `select`.
 * `tags` rides along for the work page's filter bar. */
export type CaseStudyGridPost = Pick<
  CaseStudy,
  'id' | 'title' | 'slug' | 'roles' | 'year' | 'mainMedia' | 'tags'
>

/** Grid of case-study cards — image first, title and role/year caption underneath. */
export default function CaseStudyGrid({ posts }: { posts: CaseStudyGridPost[] }) {
  return (
    <div className="gallery-grid reveal-group">
      {posts.map((post, i) => {
        const media = mediaInfo(post.mainMedia)
        const sub = [post.roles, post.year].filter(Boolean).join(', ')
        return (
          <div key={post.id} className="gallery-item" data-reveal>
            <Link href={`/work/${post.slug}`} className="work-card">
              {media ? (
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt={media.alt || post.title}
                  mimeType={media.mime}
                  width={media.width}
                  height={media.height}
                  // A card is a link, not a player. Ambient also keeps the
                  // pointer passing through to the <a> wrapping it, so the
                  // whole card stays clickable and the hover still fires.
                  ambient
                />
              ) : (
                <div className="media-frame work-card-empty">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </div>
              )}
              <div className="work-card-meta">
                {sub && <p className="work-card-info">{sub}</p>}
                <h3 className="work-card-title">
                  <span>{post.title}</span>
                  <span className="work-card-arrow" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </h3>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
