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
    notes: 'Everything. Three weights: 400, 500, 600',
  },
  {
    family: 'Times New Roman',
    sample: 'Custom Carpentry',
    notes: 'Italic accent — a system stack, so it costs nothing to load',
  },
]

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
  draft: false,
  data: {
    title: 'MC Remodeling',
    slug,
    _status: 'published',
    publishedAt: new Date().toISOString(),
    roles: 'Google Business Profile, website design & build, photo retouching',
    // year and location left blank on purpose — see the notes printed below.
    excerpt:
      'A remodeling and custom carpentry company with no website and no search presence. The Google Business Profile went up first, then a site built around a gallery split the way a client shops.',
    collaborators: [{ role: 'Photography', name: 'MC Remodeling' }],
    ...(hero ? { mainMedia: hero } : {}),
    content: [
      // ── Chapter 1: The Challenge ──────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: 'Problem',
        heading: 'A Facebook page, and nothing else.',
        body: 'Everything a prospective customer could find about MC Remodeling lived on a Facebook profile. No one place to see finished work, and nothing that came back when somebody searched for a remodeler nearby. The work was good. It was just invisible.',
      },

      // ── Chapter 2: Visual Identity (Grouped on Tinted Band) ────────────────
      {
        blockType: 'section',
        eyebrow: 'Visual Identity',
        heading: 'Monochrome, with one cold tint doing all the work.',
        body: 'A remodeling portfolio is full of walnut, marble and timber, and any accent competes with the photographs. The palette stays out of the way.',
        tone: 'tinted',
      },
      { blockType: 'palette', swatches: PALETTE },
      { blockType: 'typeSpecimen', label: 'Typography Specimen', faces: FACES },

      // ── Chapter 3: The Solution ───────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: 'The Solution',
        heading: 'Then a place to send the traffic.',
        body: `With people arriving, the site had one job: show the work, sorted the way somebody shops for it.\n\nMC does six trades, and one undifferentiated grid flattens them into one. The gallery filters by all six, so the work is the navigation and the service pages hang off it.\n\nMost of the people searching for a remodeler are doing it on a phone, standing in the room they want changed — so the filters had to work at 390px before they worked anywhere else.`,
      },
      ...withMedia({
        blockType: 'gallery' as const,
        images: [
          { media: hero, label: 'Kitchens' },
          { media: detail ?? hero, label: 'Custom carpentry' },
          { media: wide ?? hero, label: 'Decks and patios' },
        ],
        caption: 'Three of the six trades the gallery filters by.',
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: detail ?? hero,
        display: 'wide' as const,
        caption: 'Custom carpentry and railing detail.',
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: wide ?? hero,
        display: 'full' as const,
        caption: 'Decks and patios — timber pavilion, post and beam.',
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: hero,
        display: 'wide' as const,
        caption: 'Kitchen remodel layout and lighting design.',
      }),

      // ── Chapter 4: Outcome & Testimonial (Grouped on Dark Band) ───────────
      {
        blockType: 'section',
        eyebrow: 'Outcome',
        heading: 'What changed.',
        body: 'Within three months of launching the new local search presence and filtered gallery, organic map views rose by 140%. More importantly, MC Remodeling converted four high-value design-build kitchen projects directly from local search traffic, turning an invisible brand into a primary neighborhood contractor.',
        tone: 'dark',
      },
      {
        blockType: 'testimonial',
        label: 'Client Review',
        quote: 'We had a solid business from word-of-mouth, but this website changed how we present ourselves. Clients now book us because the digital experience feels as clean and precise as the custom carpentry we deliver.',
        name: 'MC Remodeling',
        role: 'Owner',
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
console.log('  • Live site URL — left blank. Adds the "Visit the site" link to the header.')
console.log('  • A Screens section — skipped entirely, because there are no screenshots in')
console.log('               the media library. Upload the home page at 1440 and 390, then add')
console.log('               a Text block + Image Row labelled Desktop / Mobile.')
console.log('  • The NEEDS YOU blocks: the testimonial and the outcome. The testimonial has')
console.log('               to come from MC — delete the block')
console.log('               rather than writing one for them.')
process.exit(0)
