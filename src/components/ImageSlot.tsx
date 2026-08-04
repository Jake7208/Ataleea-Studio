import React from 'react'

import type { Media } from '@/payload-types'
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
  /** Rendered width hint for the srcSet, e.g. '100vw'. */
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
  sizes = '100vw',
}: ImageSlotProps) {
  const info = mediaInfo(media)

  if (info) {
    return info.mime?.startsWith('video/') ? (
      <video
        className={className || undefined}
        src={info.url}
        // layout artwork, not a clip anyone came to watch: it plays itself,
        // silently, with no controls to interrupt the page
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={info.alt || label}
      />
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
        decoding="async"
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
