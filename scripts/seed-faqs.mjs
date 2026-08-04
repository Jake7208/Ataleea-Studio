/**
 * Seeds a few starter FAQs so the section has content to render.
 * Safe to re-run: skips any question that already exists.
 *
 *   npx tsx scripts/seed-faqs.mjs   (tsx, because it imports the TS config)
 *
 * These are ordinary CMS entries — edit or delete them in the admin panel.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config.ts'

const paragraph = (text) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

const faqs = [
  {
    question: 'How long does a project take?',
    answer:
      'Most sites take six to eight weeks from kickoff to launch. The largest variable is photography — if the work still needs shooting, budget an extra two weeks.',
  },
  {
    question: 'Do I need professional photography?',
    answer:
      'It makes more difference than anything else. The design is built around large images, so the photos are what separate a site that wins commercial work from one that looks like every other trade site. If you already use a photographer, I will direct the shoot. If you do not, I can shoot it myself — I am not a professional photographer, and I will not pretend otherwise, but a proper camera and careful editing clear the bar most trade sites sit at by a wide margin. Either way the editing is mine, so the finished set reads as one body of work rather than a folder of odds and ends.',
  },
  {
    question: 'Can I update the site myself?',
    answer:
      'Yes. Every project ships on a CMS, so adding a project, swapping an image or publishing an article takes a few minutes and no developer. If you would rather not, that is what the care plans cover.',
  },
  {
    question: 'What does the care plan actually include?',
    answer:
      'Hosting, backups, security updates and monitoring as standard. The Growth plan adds Google Business Profile management, two published articles a month and up to three new projects uploaded.',
  },
  {
    question: 'Do you work with businesses outside your area?',
    answer:
      'Yes — the design and build work happens remotely and we do it across the country. Local search work is tied to wherever you actually operate, not to where we are.',
  },
]

const payload = await getPayload({ config: await config })

let created = 0
for (const faq of faqs) {
  const existing = await payload.find({
    collection: 'faqs',
    where: { question: { equals: faq.question } },
    limit: 1,
  })
  if (existing.totalDocs > 0) {
    console.log(`  skip (exists): ${faq.question}`)
    continue
  }
  await payload.create({
    collection: 'faqs',
    data: { question: faq.question, answer: paragraph(faq.answer), published: true },
  })
  created += 1
  console.log(`  created: ${faq.question}`)
}

console.log(`\n${created} FAQ(s) created.`)
process.exit(0)
