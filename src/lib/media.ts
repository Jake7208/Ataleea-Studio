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
 * Widest the site ever renders an image, in CSS pixels times the device ratio.
 *
 * Matches the `xlarge` derivative in the Media collection, which is deliberately
 * the largest thing any slot can want. Its only job here is to decide whether
 * the untouched original is worth offering as a candidate — see below.
 */
const RENDER_CEILING = 2048

/**
 * Stamps an upload's last-modified time onto its URL, so that editing the image
 * changes the URL.
 *
 * Without this, a file can change underneath a URL that stays the same. Payload
 * builds derivative filenames as `{name}-{width}x{height}.webp`, and an edit
 * that does not change the proportions — a focal point nudge is the usual one —
 * regenerates those files at identical dimensions. Same URL, different bytes.
 * Re-uploading is not affected, since `overwriteExistingFiles` is left off and
 * Payload takes the next free name instead.
 *
 * That is the only thing standing between this site and an immutable cache
 * header. Four hours is the current lifetime, and it is a compromise: long
 * enough to be worth having, short enough that a stale crop rights itself the
 * same morning. With the version on the URL there is nothing to compromise
 * about — an edit is served from a URL nobody has ever requested — so the CDN
 * can be told to keep these for a year.
 */
function versioned(url: string, version: number | null): string {
  if (version === null) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${version.toString(36)}`
}

/**
 * Normalizes a Payload upload relation (id string or populated doc) to displayable info.
 * Accepts partial docs so pages can query media with `select`.
 */
export function mediaInfo(m?: string | Partial<Media> | null): MediaInfo | null {
  if (!m || typeof m === 'string' || !m.url) return null

  // Absent or unparseable leaves every URL bare, which is the old behaviour and
  // still correct — it just caches for the header's lifetime rather than until
  // the next edit.
  const parsed = m.updatedAt ? Date.parse(m.updatedAt) : NaN
  const version = Number.isNaN(parsed) ? null : parsed

  const candidates: { url: string; width: number }[] = []
  let widestDerivative = 0
  for (const size of Object.values(m.sizes ?? {})) {
    if (size?.url && size?.width) {
      candidates.push({ url: versioned(size.url, version), width: size.width })
      widestDerivative = Math.max(widestDerivative, size.width)
    }
  }

  // The original is the fallback `src` either way. It only earns a place in the
  // srcSet when the derivatives stop short of what a slot can ask for, which
  // happens for uploads too small to generate the wider sizes — `withoutEnlargement`
  // means a 600px source has nothing above the 480px thumbnail, and dropping the
  // original there would leave the srcSet upscaling 480px into a full-width slot.
  // Above the ceiling it is the other failure: the original is uncompressed
  // relative to the webp derivatives and wider than anything renders, so offering
  // it just invites a retina screen to download it for nothing.
  if (m.width && widestDerivative < RENDER_CEILING) {
    candidates.push({ url: versioned(m.url, version), width: m.width })
  }
  candidates.sort((a, b) => a.width - b.width)

  return {
    url: versioned(m.url, version),
    mime: m.mimeType ?? null,
    alt: m.alt ?? '',
    width: m.width ?? null,
    height: m.height ?? null,
    srcSet:
      candidates.length > 1 ? candidates.map((c) => `${c.url} ${c.width}w`).join(', ') : null,
  }
}
