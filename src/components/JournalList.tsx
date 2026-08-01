import Link from 'next/link'
import React from 'react'

import type { Blog } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'

/** Only the fields the list renders — lets pages query with `select`. */
export type JournalListPost = Pick<
  Blog,
  'id' | 'title' | 'slug' | 'excerpt' | 'publishedAt' | 'tags' | 'mainMedia'
>

/**
 * List of blog posts — date and categories above the title, excerpt beneath,
 * cover thumbnail alongside. Shared by the blog index and the home page.
 */
export default function JournalList({ posts }: { posts: JournalListPost[] }) {
  return (
    <div className="journal-list">
      {posts.map((post) => {
        const media = mediaInfo(post.mainMedia)
        const tags = (post.tags ?? []).filter(
          (t): t is Exclude<typeof t, string> => typeof t !== 'string',
        )
        const date = post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : null
        return (
          <Link key={post.id} href={`/blog/${post.slug}`} className="journal-row">
            {media && (
              <div className="journal-thumb">
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="240px"
                  alt={media.alt || post.title}
                  mimeType={media.mime}
                  width={media.width}
                  height={media.height}
                />
              </div>
            )}
            <div className="journal-main">
              <div className="journal-meta">
                {date && <span className="journal-date">{date}</span>}
                {tags.length > 0 && (
                  <span className="journal-cats">{tags.map((t) => t.name).join(', ')}</span>
                )}
              </div>
              <h2 className="journal-title">{post.title}</h2>
              {post.excerpt && <p className="journal-excerpt">{post.excerpt}</p>}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
