import React from 'react'

import type { Testimonial } from '@/payload-types'
import { mediaInfo } from '@/lib/media'

/** Only the fields the list renders — lets pages query with `select`. */
export type TestimonialCard = Pick<
  Testimonial,
  'id' | 'name' | 'role' | 'company' | 'companyLogo' | 'image' | 'quote'
>

/** Plain stacked list of testimonials — swap for a carousel when styling. */
export default function Testimonials({ items }: { items: TestimonialCard[] }) {
  if (items.length === 0) return null

  return (
    <div className="testimonial-list">
      {items.map((item) => {
        const portrait = mediaInfo(item.image)
        const logo = mediaInfo(item.companyLogo)
        const who = [item.role, item.company].filter(Boolean).join(', ')
        return (
          <figure key={item.id} className="testimonial">
            <blockquote className="testimonial-quote">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="testimonial-who">
              {portrait && (
                // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
                <img
                  className="testimonial-avatar"
                  src={portrait.url}
                  srcSet={portrait.srcSet ?? undefined}
                  sizes={portrait.srcSet ? '52px' : undefined}
                  alt={portrait.alt || item.name}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <span>
                <span className="testimonial-name">{item.name}</span>
                {who && <span className="testimonial-role"> — {who}</span>}
              </span>
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
                <img
                  className="testimonial-logo"
                  src={logo.url}
                  alt={logo.alt || item.company || ''}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
