/**
 * Seeds a fully worked case study, as a DRAFT, to serve as the house pattern.
 *
 *   npm run payload -- run scripts/seed-case-study-template.ts
 *   npm run payload -- run scripts/seed-case-study-template.ts --delete
 *
 * Every block type appears at least once, in the order that reads best. Copy it
 * (Payload's list view has Duplicate) and overwrite the content, or delete it
 * once the shape is in your head.
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

// The one live upload, reused wherever the pattern needs a picture. Swap these
// for real shots as you fill the template in.
const { docs: media } = await payload.find({ collection: 'media', limit: 1, depth: 0 })
const shot = media[0]?.id

const withMedia = <T,>(block: T): T[] => (shot ? [block] : [])

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
    excerpt:
      'The house pattern for a case study: what each section is for, in the order that reads best. Duplicate this, replace the content, delete what the project does not need.',
    collaborators: [{ role: 'Photography', name: 'Client supplied' }],
    ...(shot ? { mainMedia: shot } : {}),
    content: [
      // ── 1. The problem ─────────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '01 — The problem',
        heading: 'Start with what was wrong, not with what you built.',
        body: 'Two or three sentences on the state of things before you arrived: what the business does, who its customers are, and what the old site was costing them. Be specific and unflattering about the problem — a case study that opens with praise for your own work has nowhere to go.',
      },
      {
        blockType: 'text',
        description:
          'Name the constraint that shaped everything else. A tight budget, no photography, a team with no time to update a CMS, a Google profile that had never been claimed. This is the sentence a prospective client recognises themselves in, and it is the reason they keep reading.',
      },

      // ── 2. The idea ────────────────────────────────────────────────────────
      {
        blockType: 'statement',
        text: 'One sentence. The decision the whole project turned on.',
      },
      {
        blockType: 'text',
        description:
          'Then unpack it. What did that decision rule out, and what did it make possible? A statement with no paragraph after it is a slogan; a paragraph with no statement before it is a report.',
      },

      // ── 3. Colour ──────────────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '02 — Colour',
        heading: 'A palette, and what each colour is for.',
        body: 'Swatches alone are decoration. The usage line is the part a client reads — it is what tells them the palette was reasoned rather than picked.',
      },
      {
        blockType: 'palette',
        swatches: [
          { name: 'Forest', hex: '#0F2D2B', usage: 'Headings, the primary button, dark panels' },
          { name: 'Paper', hex: '#FBFAF6', usage: 'Page background — warm, never pure white' },
          { name: 'Paper alt', hex: '#F1F0E9', usage: 'Alternating sections and image frames' },
          { name: 'Ink muted', hex: '#394340', usage: 'Body copy, at AAA contrast on both surfaces' },
        ],
      },

      // ── 4. Typography ──────────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '03 — Typography',
        heading: 'Two faces, one job each.',
        body: 'Show the specimen at a size where the letterforms are legible as shapes. Say what each face is for and how it is set — weight and tracking are the details that separate a type choice from a font choice.',
      },
      {
        blockType: 'typeSpecimen',
        faces: [
          {
            family: 'Inter Tight',
            role: 'Display — headings only',
            sample: 'Built to be found',
            notes: 'Set at 500, tracked −1.5%',
          },
          {
            family: 'Inter',
            role: 'Text — body, labels, UI',
            sample: 'AaBbCc 0123456789',
            notes: 'Set at 400, 1.62 line height',
          },
        ],
      },

      // ── 5. The screens ─────────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '04 — The screens',
        heading: 'Desktop and mobile, side by side.',
        body: 'Pair them in one row and label each. Most of the audience for a trade site is on a phone, so showing only the desktop view quietly misrepresents the work.',
      },
      ...withMedia({
        blockType: 'gallery' as const,
        images: [
          { media: shot, label: 'Desktop' },
          { media: shot, label: 'Mobile' },
        ],
        caption: 'Home page, both breakpoints.',
      }),
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: shot,
        display: 'framed' as const,
        caption: 'Framed — the right setting for a screenshot.',
      }),

      // ── 6. The work itself ─────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '05 — The work',
        heading: 'Then get out of the way and show the photographs.',
        body: 'Full bleed, as large as the page allows. This is the section that does the selling, and it needs the least explaining.',
      },
      ...withMedia({
        blockType: 'mediaBlock' as const,
        media: shot,
        display: 'full' as const,
        caption: 'Full bleed — the right setting for a photograph.',
      }),

      // ── 7. Outcome ─────────────────────────────────────────────────────────
      {
        blockType: 'section',
        eyebrow: '06 — Outcome',
        heading: 'Close with something you can stand behind.',
        body: 'A number if you have one, a client sentence if you do not, and nothing at all rather than something invented. An unverifiable claim here poisons everything above it — and this is the section a sceptical reader checks first.',
      },
    ],
  },
})

console.log(`Created draft: /work/${slug}`)
console.log(shot ? '' : 'No media in the library — image blocks were skipped.')
process.exit(0)
