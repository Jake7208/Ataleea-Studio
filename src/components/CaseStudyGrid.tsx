import Link from 'next/link'
import React from 'react'

import type { CaseStudy } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'

/** Only the fields the grid renders — lets pages query with `select`.
 * `tags` rides along for the work page's filter bar. */
export type CaseStudyGridPost = Pick<
  CaseStudy,
  'id' | 'title' | 'slug' | 'roles' | 'year' | 'mainMedia' | 'tags'
>

/** Grid of case-study cards — image first, title and role/year caption underneath. */
export default function CaseStudyGrid({ posts }: { posts: CaseStudyGridPost[] }) {
  return (
    <div className="gallery-grid">
      {posts.map((post, i) => {
        const media = mediaInfo(post.mainMedia)
        const sub = [post.roles, post.year].filter(Boolean).join(' — ')
        return (
          <div key={post.id} className="gallery-item">
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
                />
              ) : (
                <div className="media-frame work-card-empty">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </div>
              )}
              <div className="work-card-meta">
                {sub && <p className="work-card-info">{sub}</p>}
                <h3 className="work-card-title">{post.title}</h3>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
