import React from 'react'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { Media } from '@/payload-types'
import { mediaInfo } from '@/lib/media'

/**
 * Renders a Lexical rich-text field. The default converters cover headings,
 * lists, links etc. — uploads are overridden so videos get a <video> tag
 * instead of the default <img>.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const info = mediaInfo(node.value as Media | string | null)
    if (!info) return null

    if (info.mime?.startsWith('video/')) {
      return <video src={info.url} controls playsInline preload="metadata" />
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
      <img
        src={info.url}
        srcSet={info.srcSet ?? undefined}
        // The article body runs the same 960px column as the hero above it, so
        // an inline image is drawn wider than the 760px this used to promise —
        // which is how a picture ends up resampled up from a smaller source.
        // 880px is the column at its widest, which is around a 1000px viewport:
        // the gutter grows with vw until it caps, so the content box is wider
        // there than it is on a large monitor.
        sizes={info.srcSet ? '(max-width: 900px) 100vw, 880px' : undefined}
        alt={info.alt}
        width={info.width ?? undefined}
        height={info.height ?? undefined}
        loading="lazy"
        decoding="async"
      />
    )
  },
})

export default function RichTextBody({ data }: { data: SerializedEditorState }) {
  return <RichText data={data} converters={converters} className="rich-text" />
}
