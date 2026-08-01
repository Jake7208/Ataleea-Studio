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
        sizes={info.srcSet ? '(max-width: 900px) 100vw, 760px' : undefined}
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
