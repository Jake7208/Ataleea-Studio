/**
 * Prints a case study's blocks in order, with enough of each to reason about
 * sequence without opening the admin.
 *
 *   npm run payload -- run scripts/dump-case-blocks.ts mc-remodeling
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const slug = process.argv[2] ?? 'mc-remodeling'
// Pass `published` to read what the public page actually renders, rather than
// the newer draft the admin shows — the two drift constantly under autosave.
const readDraft = !process.argv.includes('published')
const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: slug } },
  depth: 0,
  draft: readDraft,
  limit: 1,
})

const doc = docs[0]
if (!doc) {
  console.log(`No case study "${slug}".`)
  process.exit(1)
}

const clip = (s: unknown, n = 96) =>
  typeof s === 'string' ? s.replace(/\s+/g, ' ').slice(0, n) + (s.length > n ? '…' : '') : ''

console.log(`${doc.slug}  [${doc._status}]\n`)

;(doc.content ?? []).forEach((b, i) => {
  const n = String(i).padStart(2)
  const t = b.blockType.padEnd(14)
  let detail = ''

  if (b.blockType === 'section') {
    detail = `${b.eyebrow ? `(${b.eyebrow}) ` : ''}${b.heading ? `"${b.heading}" ` : ''}${clip(b.body, 70)}`
    if (b.tone && b.tone !== 'default') detail += `   [tone: ${b.tone}]`
  } else if (b.blockType === 'statement') detail = `"${clip(b.text)}"`
  else if (b.blockType === 'palette') detail = `${b.swatches?.length ?? 0} swatches`
  else if (b.blockType === 'typeSpecimen')
    detail = `${b.images?.length ?? 0} specimen image(s), ${b.faces?.length ?? 0} live face(s)`
  else if (b.blockType === 'gallery') detail = `${b.images?.length ?? 0} images, fit=${b.fit}`
  else if (b.blockType === 'mediaBlock')
    detail = `display=${b.display} playback=${b.playback} ${b.caption ? `"${clip(b.caption, 40)}"` : ''}`
  else if (b.blockType === 'deviceMockup')
    detail = `${b.device} fit=${b.screenFit} size=${b.size ?? '(unset)'}`
  else if (b.blockType === 'testimonial') detail = `${b.name} — "${clip(b.quote, 50)}"`

  console.log(`${n}  ${t} ${detail}`)
})

process.exit(0)
