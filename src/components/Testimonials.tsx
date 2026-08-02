'use client'

import React, { useState } from 'react'

import type { Testimonial } from '@/payload-types'
import { mediaInfo } from '@/lib/media'
import { ArrowLeft, ArrowRight } from '@/components/icons'

/** Only the fields the list renders — lets pages query with `select`. */
export type TestimonialCard = Pick<
  Testimonial,
  'id' | 'name' | 'role' | 'company' | 'companyLogo' | 'image' | 'quote'
>

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Quotes range from one line to a few hundred words, and a single type size
 * can't carry both — a long one set at pull-quote size turns into a wall.
 * Buckets are by character count; see `.testimonial[data-size]` for the sizes.
 */
const sizeOf = (quote: string) => (quote.length > 320 ? 'long' : quote.length > 140 ? 'mid' : 'short')

/**
 * One quote at a time, stepped with the studio's arrows. Every quote stays in
 * the DOM stacked in a single grid cell so the crossfade has something to fade
 * between; the ones not showing are `inert` so tab order and screen readers
 * skip them. The block holds the height of the longest quote and each slide
 * hangs its attribution off the bottom, so stepping moves nothing but the
 * words — the arrows stay put.
 *
 * The quote being replaced is tracked separately from the one coming in: it
 * needs to leave upwards while the next one rises from below, which the two
 * can't share a single resting state for.
 */
export default function Testimonials({ items }: { items: TestimonialCard[] }) {
  const [index, setIndex] = useState(0)
  // the quote most recently stepped away from — plays the exit, then parks
  const [leaving, setLeaving] = useState<number | null>(null)
  const count = items.length

  const step = (dir: 1 | -1) => {
    setLeaving(index)
    setIndex((index + dir + count) % count)
  }

  // arrows step the quotes while focus is anywhere in the carousel
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }

  if (count === 0) return null

  return (
    <div className="testimonial-carousel" data-reveal onKeyDown={onKeyDown}>
      <div className="testimonial-viewport" aria-live="polite">
        {items.map((item, i) => {
          const portrait = mediaInfo(item.image)
          const logo = mediaInfo(item.companyLogo)
          const who = [item.role, item.company].filter(Boolean).join(', ')
          const current = i === index
          const isLeaving = i === leaving && !current

          return (
            <figure
              key={item.id}
              className={`testimonial ${current ? 'is-current' : ''} ${isLeaving ? 'is-leaving' : ''}`}
              data-size={sizeOf(item.quote)}
              inert={!current}
            >
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

      {/* nothing to step through with a single quote */}
      {count > 1 && (
        <div className="testimonial-controls">
          <span className="testimonial-count">
            <span className="testimonial-count-now">{pad(index + 1)}</span> / {pad(count)}
          </span>

          <div className="testimonial-navrow">
            <button
              type="button"
              className="testimonial-nav"
              onClick={() => step(-1)}
              aria-label="Previous testimonial"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              className="testimonial-nav"
              onClick={() => step(1)}
              aria-label="Next testimonial"
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
