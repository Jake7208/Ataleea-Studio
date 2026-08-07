import Link from 'next/link'
import React from 'react'

import type { Blog } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'
import { formatDate, kindLabel } from '@/lib/news'
import { reveal } from '@/lib/reveal'

/** Only the fields the card renders — lets pages query with `select`. */
export type NewsCardPost = Pick<
  Blog,
  'id' | 'title' | 'slug' | 'publishedAt' | 'kind' | 'tags' | 'mainMedia'
>

type NewsCardProps = {
  post: NewsCardPost
  /** Corner flag on the image. The index uses it for the lead card; the related grid has no lead. */
  badge?: string
  /** Passed through to the cover — the grid is three up on the index and on an article. */
  sizes?: string
}

/**
 * One article in a news grid: cover, type chip, date, title.
 *
 * Shared by the newsroom index and the "Explore related" grid under an article
 * so a card is the same object in both places. The row layout it replaced on the
 * article page put related reading in a different shape to the index it links
 * to, which read as two separate treatments of the same content.
 */
export function NewsCard({ post, badge, sizes = '(max-width: 600px) 100vw, 33vw' }: NewsCardProps) {
  const media = mediaInfo(post.mainMedia)
  const date = formatDate(post.publishedAt, 'short')

  return (
    <Link href={`/newsroom/${post.slug}`} className="news-card" {...reveal}>
      {media && (
        <div className="news-card-image">
          {badge && <span className="news-card-featured-badge">{badge}</span>}
          <Media
            src={media.url}
            srcSet={media.srcSet}
            sizes={sizes}
            alt={media.alt || post.title}
            mimeType={media.mime}
            width={media.width}
            height={media.height}
          />
        </div>
      )}
      <div className="news-card-content">
        <div className="news-card-meta">
          {/* The post's own kind, not whichever tag sorted first. A post about
              web performance is still an Article; the topic belongs on the
              filter, not on the chip. */}
          <span className="news-card-tag">{kindLabel(post.kind)}</span>
          {date && <span className="news-card-date">{date}</span>}
        </div>
        <h3 className="news-card-title">{post.title}</h3>
      </div>
    </Link>
  )
}

export default NewsCard
