import React from 'react'

import AmbientVideo from '@/components/AmbientVideo'

type Props = {
  src: string
  srcSet?: string | null
  sizes?: string
  alt: string
  mimeType?: string | null
  width?: number | null
  height?: number | null
  loading?: 'lazy' | 'eager'
  /**
   * Render video as scenery rather than as a player: silent, looping, inert to
   * the pointer, playing only while on screen. No effect on stills, so a slot
   * that holds either can set it once and stop caring which it got.
   */
  ambient?: boolean
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
  ambient = false,
}: Props) {
  const isVideo = mimeType?.startsWith('video/')

  return (
    <div className="media-frame">
      {isVideo && ambient ? (
        <AmbientVideo src={src} label={alt} />
      ) : isVideo ? (
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
