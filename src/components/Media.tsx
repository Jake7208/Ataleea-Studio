import React from 'react'

type Props = {
  src: string
  srcSet?: string | null
  sizes?: string
  alt: string
  mimeType?: string | null
  width?: number | null
  height?: number | null
  loading?: 'lazy' | 'eager'
}

/**
 * Plain renderer for a Payload upload — <video> for videos, <img> for
 * everything else. Wrapped in a .media-frame div as a styling hook.
 */
export default function Media({
  src,
  srcSet,
  sizes,
  alt,
  mimeType,
  width,
  height,
  loading = 'lazy',
}: Props) {
  return (
    <div className="media-frame">
      {mimeType?.startsWith('video/') ? (
        <video src={src} controls playsInline preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
        <img
          src={src}
          srcSet={srcSet ?? undefined}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          width={width ?? undefined}
          height={height ?? undefined}
          loading={loading}
          decoding="async"
        />
      )}
    </div>
  )
}
