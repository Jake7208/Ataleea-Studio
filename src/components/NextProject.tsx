import Link from 'next/link'
import React from 'react'

import type { CaseStudyGridPost } from '@/components/CaseStudyGrid'
import Media from '@/components/Media'
import { mediaInfo } from '@/lib/media'
import { ArrowRight } from '@/components/icons'

/**
 * Closes a case study by pointing at the next one.
 *
 * One full-bleed panel with the title over the image, rather than a card with
 * the title stacked underneath. Two reasons. The stacked version put an image,
 * a heading, a meta line and a list of further links between the end of the
 * study and the footer's own call to action — four things competing at the
 * exact point a reader has finished and is deciding what to do. And it ran the
 * photograph at its natural height, which cost most of a screen for what is
 * really just a link.
 *
 * Everything is inside one anchor now, so the whole panel is the target rather
 * than a title beside a picture that also happens to be clickable. "All work"
 * sits outside it, because a link cannot contain another link.
 */
export default function NextProject({ next }: { next: CaseStudyGridPost }) {
  const media = mediaInfo(next.mainMedia)
  const sub = [next.roles, next.year].filter(Boolean).join(', ')

  return (
    <section className="next-project">
      {/* Above the panel rather than below it. Trailing the panel, this read as
          a loose strip after the ending instead of part of it — and the panel is
          the closing statement, so nothing should come after it. */}
      <div className="container next-head">
        <Link href="/work" className="next-all">
          All work
          <ArrowRight />
        </Link>
      </div>

      <Link href={`/work/${next.slug}`} className="next-lead">
        <div className="next-lead-media">
          {media && (
            <Media
              src={media.url}
              srcSet={media.srcSet}
              sizes="100vw"
              alt={media.alt || next.title}
              mimeType={media.mime}
              width={media.width}
              height={media.height}
              // A video here behaves like every other clip on the site.
              ambient
            />
          )}
        </div>

        <div className="next-lead-body">
          <div className="container">
            <p className="next-eyebrow">Next project</p>
            <h2 className="next-lead-title">
              <span>{next.title}</span>
              <span className="next-lead-arrow" aria-hidden="true">
                <ArrowRight />
              </span>
            </h2>
            {sub && <p className="next-lead-info">{sub}</p>}
          </div>
        </div>
      </Link>
    </section>
  )
}
