/**
 * Seeds a fully worked case study, as a DRAFT, to serve as the house pattern.
 *
 *   npm run payload -- run scripts/seed-case-study-template.ts
 *   npm run payload -- run scripts/seed-case-study-template.ts --delete
 *
 * Copy it (Payload's list view has Duplicate) and overwrite the content, or
 * delete it once the shape is in your head.
 *
 * The pattern is deliberately image-led: three pieces of copy in the whole
 * study — the problem, the testimonial and the outcome — with everything
 * between them carried by images at varying widths. Colour and Typography have
 * no introduction at all; those blocks carry their own one-word label, because
 * a paragraph explaining what a palette is sits above a picture of the palette.
 *
 * It stays a draft: /work and the home page both filter drafts out, so this
 * cannot appear on the live site by accident. Use the Preview button to read it.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const slug = 'template-anatomy-of-a-case-study'
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

if (process.argv.includes('--delete')) {
  console.log(`Deleted ${existing.docs.length}.`)
  process.exit(0)
}

// Whatever is in the library, cycled through so a seeded study comes out fully
// illustrated instead of repeating one picture. Swap these for real shots as
// you fill the template in.
const { docs: media } = await payload.find({ collection: 'media', limit: 12, depth: 0 })
const shots = media.map((m) => m.id)
const shot = shots[0]
const pic = (i: number) => shots[i % shots.length]

const withMedia = <T>(block: T): T[] => (shot ? [block] : [])

// Same convention as the MC seed: a fact only you have is written as a visible
// prompt rather than a plausible sentence, so it cannot be published by accident.
const NEEDS = (question: string) => `NEEDS YOU — ${question}`

await payload.create({
  collection: 'case-studies',
  draft: true,
  data: {
    title: 'Anatomy of a case study',
    slug,
    _status: 'draft',
    publishedAt: new Date().toISOString(),
    roles: 'Website design & build, photo retouching',
    location: 'Kansas City, MO',
    year: 2026,
    liveUrl: 'https://example.com',
    excerpt:
      'The house pattern for a case study: what each section is for, in the order that reads best. Duplicate this, replace the content, delete what the project does not need.',
    collaborators: [{ role: 'Photography', name: 'Client supplied' }],
    ...(shot ? { mainMedia: shot } : {}),
    content: [
      // ── Chapter 1: The Challenge ──────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: 'Problem',
        heading: 'Start with what was wrong, not with what you built.',
        body: 'What the business does, and what the old site was costing them. Be unflattering — a study that opens with praise for your own work has nowhere to go. Two or three sentences, then stop and show the work.',
      },

      // ── Chapter 2: Visual Identity (Grouped on Tinted Band) ────────────────
      {
        blockType: 'section',
        eyebrow: 'Visual Identity',
        heading: 'Defining the visual language.',
        body: 'Designing a tailored system of colors and typography to establish a premium and cohesive digital presence.',
        tone: 'tinted',
      },
      {
        blockType: 'palette',
        label: 'Colour System',
        swatches: [
          { name: 'Forest', hex: '#0F2D2B', usage: 'Headings, the primary button, dark panels' },
          { name: 'Paper', hex: '#FBFAF6', usage: 'Page background — warm, never pure white' },
          { name: 'Paper alt', hex: '#F1F0E9', usage: 'Alternating sections and image frames' },
          {
            name: 'Ink muted',
            hex: '#394340',
            usage: 'Body copy, at AAA contrast on both surfaces',
          },
        ],
      },
      {
        blockType: 'typeSpecimen',
        label: 'Typography Specimen',
        ...(shot ? { image: pic(2) } : {}),
        faces: [],
      },

      // ── Chapter 3: The Solution ───────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: 'The Solution',
        heading: 'A tailored, mobile-first design strategy.',
        body: 'We structured the core pages to guide prospective clients toward booking, demonstrating capabilities with high-fidelity, flat device mockups.',
      },
      ...withMedia({
        blockType: 'gallery' as const,
        fit: 'crop' as const,
        images: [{ media: pic(1) }, { media: pic(2) }, { media: pic(3) }],
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: pic(0),
        display: 'wide' as const,
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: pic(3),
        display: 'full' as const,
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: pic(4),
        display: 'wide' as const,
      }),

      // ── Chapter 4: Outcome & Testimonial (Grouped on Dark Band) ───────────
      {
        blockType: 'section',
        eyebrow: 'Outcome',
        heading: 'Close with something you can stand behind.',
        body: 'A number if you have one, a client sentence if you do not, and nothing at all rather than something invented. This is the section a sceptical reader checks first.',
        tone: 'dark',
      },
      {
        blockType: 'testimonial',
        label: 'Client Review',
        quote: NEEDS(
          'a real sentence from the client — ask what changed for the business, and quote the answer verbatim rather than tidying it up',
        ),
        name: 'Client name',
        role: 'Owner',
        company: 'Company',
      },
    ],
  },
})

console.log(`Created draft: /work/${slug}`)
console.log(shot ? '' : 'No media in the library — image blocks were skipped.')
process.exit(0)
