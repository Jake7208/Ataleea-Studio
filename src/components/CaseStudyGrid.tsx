import Link from 'next/link'
import React from 'react'

import type { CaseStudy } from '@/payload-types'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'
import { reveal } from '@/lib/reveal'

/** Only the fields the grid renders — lets pages query with `select`.
 * `tags` rides along for the work page's filter bar. */
export type CaseStudyGridPost = Pick<
  CaseStudy,
  'id' | 'title' | 'slug' | 'roles' | 'year' | 'mainMedia' | 'tags'
>

/**
 * Grid of case-study covers, laid out as a NewsCard is: artwork, then the tag
 * chip and year, then the title, then the roles line.
 *
 * The two card types are the same object with different content, so they read
 * the same — chip, meta, ruled title that sweeps on hover. What stays different
 * is the crop: a news cover is a 16:10 photograph and a case-study cover is
 * composed artwork on a 4:3 canvas, and squeezing the latter into the former
 * would crop the composition rather than align anything.
 *
 * Covers fill their frame rather than sitting matted inside it, which only
 * holds because every cover is composed to the same 4:3 canvas before upload
 * (see the `mainMedia` field description). Drop a raw screenshot in here and it
 * will be cropped to fit like anything else.
 */
export default function CaseStudyGrid({ posts }: { posts: CaseStudyGridPost[] }) {
  return (
    <div className="gallery-grid reveal-group">
      {posts.map((post, i) => {
        const media = mediaInfo(post.mainMedia)
        // the first populated tag names the chip; the site calls these projects
        const tag = (post.tags ?? []).find(
          (t): t is Exclude<typeof t, string> => typeof t !== 'string' && Boolean(t.name),
        )
        return (
          <div key={post.id} className="gallery-item" {...reveal}>
            <Link href={`/work/${post.slug}`} className="work-card">
              {media ? (
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
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
              {/* Title above the role line: the project is what someone is
                  scanning for, and leading with the roles made every card open
                  on the same few repeated words. The chip and year sit above it
                  the way a category and date do on a news card — short, fixed
                  length, and anchored by the chip, which is why they can be the
                  opening line where the roles could not. */}
              <div className="work-card-meta">
                <div className="work-card-line">
                  <span className="work-card-tag">{tag?.name || 'Project'}</span>
                  {post.year && <span className="work-card-year">{post.year}</span>}
                </div>
                <h3 className="work-card-title">{post.title}</h3>
                {post.roles && <p className="work-card-info">{post.roles}</p>}
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
