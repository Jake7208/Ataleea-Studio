import React from 'react'
import { preload } from 'react-dom'

import type { Media } from '@/payload-types'
import AmbientVideo from '@/components/AmbientVideo'
import { mediaInfo } from '@/lib/media'

type ImageSlotProps = {
  /** Short name for the shot. */
  label: string
  /** One-line brief: subject and framing. */
  spec: string
  /** CSS aspect-ratio value, e.g. '16 / 9'. */
  ratio?: string
  className?: string
  /**
   * The uploaded artwork, from the `site-media` global. When it resolves the
   * brief is replaced entirely; when it doesn't — nothing uploaded yet — the
   * brief stays, so the layout holds and the gap is still obvious in review.
   */
  media?: string | Partial<Media> | null
  /** Above the fold, pass 'eager' — the hero shouldn't wait on lazy loading. */
  loading?: 'lazy' | 'eager'
  /**
   * Only for the one image that is the page's Largest Contentful Paint. `eager`
   * alone just means "don't defer"; it still starts at the low priority the
   * browser gives every image, behind the stylesheet and the scripts. This is
   * what moves it to the front of that queue, and it is worth nothing if more
   * than one image on the page claims it.
   */
  fetchPriority?: 'high' | 'low' | 'auto'
  /**
   * Rendered width hint for the srcSet, e.g. '100vw'. Worth getting right: this
   * is what the browser picks a candidate with, and it picks before it knows
   * anything about your layout, so an over-stated value is silently paid for in
   * bytes on every load.
   */
  sizes?: string
}

/**
 * A fixed image position in a page layout: either the artwork itself, or the
 * brief for artwork that hasn't been shot yet.
 *
 * Both states render as a single element in the same position, so the
 * surrounding CSS — which already targets `.image-slot`, `img` and `video`
 * together — lays them out identically either way.
 */
export default function ImageSlot({
  label,
  spec,
  ratio = '16 / 9',
  className = '',
  media,
  loading = 'lazy',
  fetchPriority,
  sizes = '100vw',
}: ImageSlotProps) {
  const info = mediaInfo(media)

  if (info) {
    if (loading === 'eager') {
      preload(info.url, {
        as: 'image',
        fetchPriority: 'high',
        imageSrcSet: info.srcSet ?? undefined,
        imageSizes: info.srcSet ? sizes : undefined,
      })
    }
    return info.mime?.startsWith('video/') ? (
      // Layout artwork, not a clip anyone came to watch — the same treatment
      // every other video on the site gets, rather than a second hand-rolled
      // autoplay that misses the reset, the reduced-motion opt-out and the
      // pointer-events rule that keeps Lenis owning the scroll.
      <AmbientVideo src={info.url} label={info.alt || label} className={className} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
      <img
        className={className || undefined}
        src={info.url}
        srcSet={info.srcSet ?? undefined}
        sizes={info.srcSet ? sizes : undefined}
        alt={info.alt || label}
        width={info.width ?? undefined}
        height={info.height ?? undefined}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={loading === 'eager' ? 'sync' : 'async'}
      />
    )
  }

  return (
    <div
      className={`image-slot ${className}`.trim()}
      style={{ '--slot-ratio': ratio } as React.CSSProperties}
      role="img"
      aria-label={`Image placeholder — ${label}`}
    >
      <span className="image-slot-label">{label}</span>
      <span className="image-slot-spec">{spec}</span>
    </div>
  )
}
