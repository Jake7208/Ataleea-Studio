import type { Media } from '@/payload-types'

export type MediaInfo = {
  url: string
  mime: string | null
  alt: string
  width: number | null
  height: number | null
  /** responsive candidates built from the generated image sizes */
  srcSet: string | null
}

/**
 * Normalizes a Payload upload relation (id string or populated doc) to displayable info.
 * Accepts partial docs so pages can query media with `select`.
 */
export function mediaInfo(m?: string | Partial<Media> | null): MediaInfo | null {
  if (!m || typeof m === 'string' || !m.url) return null

  const candidates: { url: string; width: number }[] = []
  for (const size of Object.values(m.sizes ?? {})) {
    if (size?.url && size?.width) candidates.push({ url: size.url, width: size.width })
  }
  if (m.width) candidates.push({ url: m.url, width: m.width })
  candidates.sort((a, b) => a.width - b.width)

  return {
    url: m.url,
    mime: m.mimeType ?? null,
    alt: m.alt ?? '',
    width: m.width ?? null,
    height: m.height ?? null,
    srcSet:
      candidates.length > 1 ? candidates.map((c) => `${c.url} ${c.width}w`).join(', ') : null,
  }
}

/** Picks a frame aspect ratio class suffix based on the media's own proportions. */
export function ratioFor(info: MediaInfo | null): '4-3' | '3-4' | '1-1' | '16-9' {
  if (!info?.width || !info?.height) return '4-3'
  const r = info.width / info.height
  if (r < 0.9) return '3-4'
  if (r < 1.15) return '1-1'
  if (r > 1.6) return '16-9'
  return '4-3'
}
