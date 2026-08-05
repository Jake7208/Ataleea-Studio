/**
 * Reports, and optionally repairs, the publish status of every case study.
 *
 *   npm run payload -- run scripts/check-case-status.ts
 *   npm run payload -- run scripts/check-case-status.ts republish <slug>
 *
 * Written after a bulk content edit knocked a published study back to draft:
 * the public `read` access on the collection filters to `_status: published`,
 * so a study that loses that status stops 404s at the page rather than showing
 * an error, and looks from the outside exactly like a routing bug.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const args = process.argv.slice(2)
const republish = args[0] === 'republish' ? args[1] : null

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'case-studies',
  limit: 1000,
  depth: 0,
  draft: true,
  pagination: false,
})

for (const doc of docs) {
  const blocks = (doc.content ?? []).map((b) => b.blockType)
  const devices = blocks.filter((b) => b === 'deviceMockup').length
  console.log(
    `${String(doc._status).padEnd(10)} ${String(doc.slug).padEnd(38)} ` +
      `${devices} device mockup(s)`,
  )

  for (const b of doc.content ?? []) {
    if (b.blockType !== 'deviceMockup') continue
    console.log('   device      ', b.device)
    console.log('   screenFit   ', b.screenFit)
    console.log('   screenColor ', b.screenColor)
    console.log('   display     ', b.display)
    const m = typeof b.media === 'string' ? await payload.findByID({
      collection: 'media', id: b.media, depth: 0,
    }).catch(() => null) : b.media
    if (m) {
      console.log(`   media        ${m.filename}  ${m.width}x${m.height}  ${m.mimeType}`)
      // Video has neither — Payload only measures images — which is itself
      // worth seeing, since a screen with no intrinsic size is a broken one.
      console.log(
        `   media ratio  ${m.width && m.height ? (m.width / m.height).toFixed(4) : 'unknown (no dimensions stored)'}   (16" screen is 1.5470)`,
      )
    }
  }
}

if (republish) {
  const target = docs.find((d) => d.slug === republish)
  if (!target) {
    console.log(`\nNo case study with slug "${republish}".`)
    process.exit(1)
  }

  await payload.update({
    collection: 'case-studies',
    id: target.id,
    // Both are needed together: `draft: false` writes to the published version,
    // and the explicit status is what actually restores it — an update alone
    // leaves whatever status the document already had.
    data: { _status: 'published' },
    draft: false,
  })

  console.log(`\nRepublished ${republish}.`)
}

process.exit(0)
