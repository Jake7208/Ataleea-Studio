/**
 * Seeds the MC Remodeling case study — the studio's first published project.
 *
 *   npm run payload -- run scripts/seed-mc-remodeling.ts
 *   npm run payload -- run scripts/seed-mc-remodeling.ts images
 *   npm run payload -- run scripts/seed-mc-remodeling.ts delete
 *
 * Bare words, not --flags: npm and the Payload CLI between them strip anything
 * starting with `--` before the script ever sees process.argv.
 *
 * Re-running replaces the draft, so it is safe to edit this file and run again
 * until the copy is right — but anything typed in the admin is overwritten, so
 * once you start editing there, stop running this.
 *
 * The colour and type sections are measured, not guessed: computed styles were
 * read off the live site (see the comments on PALETTE and FACES). Everything
 * marked NEEDS-YOU is a fact only you have — it is written as a visible prompt
 * rather than a plausible sentence, so it cannot be published by accident.
 *
 * Stays a draft. /work and the home page both filter drafts out.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const slug = 'mc-remodeling'
const args = process.argv.slice(2)
const withImages = args.includes('images')

const CDN = 'https://cdn.prod.website-files.com/67114b9023e5326ccf4f7ea6'

const images = [
  {
    slot: 'hero' as const,
    file: '671dc42533d9ef20db466b47_kitchent-remodel-image-gallery.webp',
    alt: 'Remodelled kitchen with walnut cabinetry, a marble island and globe pendants under skylights',
  },
  {
    slot: 'statement' as const,
    file: '671dc610e543b4a8d6979b3e_MC-remodeling-custom-railing-gallery.webp',
    alt: 'Custom painted stair railing and balustrade on a landing',
  },
  {
    slot: 'band' as const,
    file: '671c4858fcbe13a7baf8d1cd_MC-remodeling-decks-and-patios.webp',
    alt: 'Timber-framed pavilion with exposed post-and-beam joinery over a concrete patio',
  },
]

/**
 * Read off the live site by sampling computed styles across every visible
 * element and ranking by frequency — not picked by eye. Counts in the comments
 * are how many elements resolved to that colour on the home page.
 */
const PALETTE = [
  { name: 'Ink', hex: '#191921', usage: 'Headings and body copy. Near-black with a blue cast, never pure #000.' }, // ×156
  { name: 'Paper', hex: '#FFFFFF', usage: 'Page background, and the cards that sit on the tinted sections.' },
  { name: 'Muted', hex: '#6D6D6D', usage: 'Supporting paragraphs under a heading, and form labels.' }, // ×23
  { name: 'Near black', hex: '#090B12', usage: 'Dark panels and the solid Call Us button — a step deeper than the ink.' }, // ×5
  { name: 'Tint', hex: '#EEF7FF', usage: 'The one non-neutral: a cold wash behind alternating sections.' },
  { name: 'Hairline', hex: '#CCCCCC', usage: 'Dividers and the outline on secondary buttons.' },
]

/**
 * Switzer is the only webfont the site loads — confirmed against
 * document.fonts, which lists exactly three faces (400, 500, 600) and nothing
 * else. The italic serif is a declared system stack, not a failed webfont.
 */
const FACES = [
  {
    family: 'Switzer',
    role: 'Everything — headings, body, buttons, navigation',
    sample: 'Transforming Homes',
    notes: 'Three weights only: 400, 500, 600. h1 at 600/61px, body at 500/21px.',
  },
  {
    family: 'Times New Roman',
    role: 'Italic accent — one or two words inside a heading',
    sample: 'Custom Carpentry',
    notes: 'A system stack (Times, Baskerville, Georgia), so it costs nothing to load.',
  },
]

const NEEDS = (question: string) => `NEEDS YOU — ${question}`

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: slug } },
  limit: 1,
  draft: true,
})

for (const doc of existing.docs) {
  await payload.delete({ collection: 'case-studies', id: doc.id })
}

if (args.includes('delete')) {
  console.log(`Deleted ${existing.docs.length}.`)
  process.exit(0)
}

// ── Images ──────────────────────────────────────────────────────────────────

const slots: Record<string, string> = {}

if (withImages) {
  for (const img of images) {
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: img.file } },
      limit: 1,
    })

    if (found.totalDocs > 0) {
      slots[img.slot] = String(found.docs[0].id)
      console.log(`  skip (exists): ${img.file}`)
      continue
    }

    // fetch throws on a network fault rather than returning !ok, and one flaky
    // request should not abort a run that has already uploaded the others.
    let buffer: Buffer
    let mimetype = 'image/webp'
    try {
      const res = await fetch(`${CDN}/${img.file}`)
      if (!res.ok) {
        console.log(`  FAILED ${res.status}: ${img.file}`)
        continue
      }
      mimetype = res.headers.get('content-type') || mimetype
      buffer = Buffer.from(await res.arrayBuffer())
    } catch (err) {
      console.log(`  FAILED (network): ${img.file} — ${(err as Error).message}`)
      console.log('  Re-run to retry; anything already uploaded is skipped.')
      continue
    }

    const doc = await payload.create({
      collection: 'media',
      data: { alt: img.alt },
      file: {
        data: buffer,
        mimetype,
        name: img.file,
        size: buffer.length,
      },
    })
    slots[img.slot] = String(doc.id)
    console.log(`  uploaded: ${img.file}`)
  }
}

const hero = slots.hero
const detail = slots.statement
const wide = slots.band
const withMedia = <T,>(block: T): T[] => (withImages && hero ? [block] : [])

// ── Case study ──────────────────────────────────────────────────────────────

await payload.create({
  collection: 'case-studies',
  draft: true,
  data: {
    title: 'MC Remodeling',
    slug,
    _status: 'draft',
    publishedAt: new Date().toISOString(),
    roles: 'Google Business Profile, website design & build, photo retouching',
    // year and location left blank on purpose — see the notes printed below.
    excerpt:
      'A remodeling and custom carpentry company with no website and no search presence. The Google Business Profile went up first, then a site built around a gallery split the way a client shops.',
    collaborators: [{ role: 'Photography', name: 'MC Remodeling' }],
    ...(hero ? { mainMedia: hero } : {}),
    content: [
      {
        blockType: 'section',
        eyebrow: '01 — The problem',
        heading: 'A Facebook page, and nothing else.',
        body: 'MC Remodeling had no website. Everything a prospective customer could find about them lived on a Facebook profile — no one place to see finished work, and nothing that came back when somebody searched for a remodeler nearby. The work was good. It was just invisible.',
      },

      {
        blockType: 'statement',
        text: 'So the first thing I built was not the website.',
      },
      {
        blockType: 'text',
        description:
          'A new site earns nothing if nobody arrives at it. The Google Business Profile went up first — set up properly, with the categories and the service area right — because that is what puts a trade business in the map results, and the map results are where local work actually starts.',
      },
      {
        blockType: 'text',
        description:
          'Then I sat down with them and went through how ranking works: what moves it, what does not, and why their own customers are the strongest lever they have on it. That part is not a deliverable and it does not show up in a screenshot, but it is the difference between a profile that keeps climbing and one that is accurate on the day it is handed over and never touched again.',
      },

      {
        blockType: 'section',
        eyebrow: '02 — The site',
        heading: 'Then a place to send the traffic.',
        body: 'With people arriving, the site had one job: show the work, sorted the way somebody shops for it.',
      },
      {
        blockType: 'text',
        description:
          'MC does kitchens, bathrooms, flooring, decks and patios, doors and trim, and custom carpentry — six trades that a single undifferentiated grid flattens into one. The gallery is filterable by all six, so someone pricing a bathroom sees bathrooms. That set the shape of the whole site: the work is the navigation, and the service pages hang off it rather than the other way round.',
      },

      {
        blockType: 'section',
        eyebrow: '03 — Colour',
        heading: 'Monochrome, with one cold tint doing all the work.',
        body: 'There is no brand colour here, and that is the point — a remodeling portfolio is full of walnut, marble, paint and timber, and any accent competes with the photographs. The palette stays out of the way and lets the materials carry the colour.',
      },
      { blockType: 'palette', swatches: PALETTE },

      {
        blockType: 'section',
        eyebrow: '04 — Typography',
        heading: 'One typeface, three weights, and a borrowed italic.',
        body: 'Switzer is the only webfont the site loads. The italic serif that picks out “Remodeling” and “Custom Carpentry” in the headlines is the system serif — Times, then Baskerville, then Georgia — so the contrast costs nothing to download. One face doing structure, one doing emphasis.',
      },
      { blockType: 'typeSpecimen', faces: FACES },

      {
        blockType: 'section',
        eyebrow: '05 — The screens',
        heading: 'Desktop and phone.',
        body: 'Most of the people searching for a remodeler are doing it on a phone, standing in the room they want changed. The gallery filters had to work at 390px before they worked anywhere else.',
      },
      ...withMedia({
        blockType: 'gallery' as const,
        images: [
          { media: hero, label: 'Desktop' },
          { media: detail ?? hero, label: 'Mobile' },
        ],
        caption: 'Replace both with real screenshots — home page at 1440 and 390.',
      }),

      {
        blockType: 'section',
        eyebrow: '06 — The work',
        heading: 'And then the projects themselves.',
        body: 'The photography is MC Remodeling’s own. I did the retouching and colour work across the full set — which is why the gallery reads as one body of work rather than a folder of shots taken on different phones months apart. Consistent editing is most of what separates a portfolio from a camera roll.',
      },
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: wide ?? hero,
        display: 'full' as const,
        caption: 'Decks and patios — timber pavilion, post and beam.',
      }),

      {
        blockType: 'section',
        eyebrow: '07 — Outcome',
        heading: 'What changed.',
        body: NEEDS(
          'anything measurable — enquiries per month, calls, a job won off the site, a search ranking. If you have no numbers, one honest sentence from MC is worth more than an invented statistic. If you have neither yet, delete this section rather than filling it with adjectives.',
        ),
      },
    ],
  },
})

console.log(`\nCreated draft: /work/${slug}`)
if (!withImages) {
  console.log('\nNo images fetched — run with --with-images, or upload these:')
  for (const img of images) console.log(`  ${img.slot.padEnd(10)} ${CDN}/${img.file}`)
}
console.log('\nStill to fill in, in the admin:')
console.log('  • Year     — left blank. Webflow asset ids date to Oct 2024, but that is')
console.log('               their upload date, not necessarily your build date.')
console.log('  • Location — left blank. I do not know where MC operates.')
console.log('  • The three NEEDS YOU sections: the problem, the constraint, the outcome.')
process.exit(0)
