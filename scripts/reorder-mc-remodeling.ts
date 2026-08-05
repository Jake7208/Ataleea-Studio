/**
 * Reorders the MC Remodeling case study into a conventional case-study arc.
 *
 *   npm run payload -- run scripts/reorder-mc-remodeling.ts dry
 *   npm run payload -- run scripts/reorder-mc-remodeling.ts
 *
 * The blocks themselves are not edited — only their sequence, plus the one
 * gallery row still set to `crop`. Written as an explicit permutation of the
 * current indices and checked against the blocks actually present, so it
 * refuses to run rather than scrambling a study that has been edited since.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dryRun = process.argv.slice(2).includes('dry')
const slug = 'mc-remodeling'

/**
 * New order, by current index.
 *
 * The reveal moves up. A reader arriving at a case study wants to see the thing
 * that was made before being walked through how it was made — the old order put
 * the palette and the type specimen ahead of the first sight of the website,
 * which is the part that answers "what did you build". Identity work then reads
 * as evidence rather than as preamble.
 *
 * The full-bleed shot moves to just before the outcome, so the page's biggest
 * visual break lands once, late, instead of mid-sequence.
 */
const ORDER = [
  0, //  Problem            — sets the stakes
  4, //  The Solution       — what was built
  5, //  Device mockup      — the reveal, and the strongest image on the page
  1, //  Visual Identity    — tinted band opens here
  2, //  Palette            — joins that band
  3, //  Typography         — joins that band
  6, //  Media (framed)     — gallery page
  8, //  Image row
  7, //  Media (full bleed) — the one full-width break, held until late
  9, //  Outcome            — dark band
  10, // Testimonial        — joins the dark band
]

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: slug } },
  depth: 0,
  draft: true,
  limit: 1,
})

const doc = docs[0]
if (!doc) {
  console.log(`No case study "${slug}".`)
  process.exit(1)
}

const content = doc.content ?? []

// Refuse rather than guess: the permutation is written against a known layout.
if (content.length !== ORDER.length) {
  console.log(
    `Expected ${ORDER.length} blocks, found ${content.length}. ` +
      `The study has changed — re-check the order against dump-case-blocks.ts before running this.`,
  )
  process.exit(1)
}

const next = ORDER.map((i) => {
  const block = content[i]
  // The one content fix that rides along: a row left on the old `crop` default
  // is forced into a phone-portrait box and loses two thirds of a landscape photo.
  if (block.blockType === 'gallery' && block.fit === 'crop') {
    return { ...block, fit: 'natural' as const }
  }
  return block
})

console.log(`${slug} [${doc._status}] — new order:\n`)
next.forEach((b, i) => {
  const from = ORDER[i]
  const label =
    b.blockType === 'section'
      ? `${b.eyebrow ? `(${b.eyebrow}) ` : ''}${b.heading ?? ''}`
      : b.blockType === 'testimonial'
        ? b.name
        : ''
  console.log(`${String(i).padStart(2)}  was ${String(from).padStart(2)}  ${b.blockType.padEnd(14)} ${label}`)
})

if (dryRun) {
  console.log('\nDry run — nothing written.')
  process.exit(0)
}

await payload.update({
  collection: 'case-studies',
  id: doc.id,
  data: { content: next },
  // Carry the status through explicitly. Updating without it is what silently
  // knocked this study out of `published` the last time it was edited by script.
  draft: doc._status !== 'published',
})

console.log(`\nReordered. Status left as ${doc._status}.`)
process.exit(0)
