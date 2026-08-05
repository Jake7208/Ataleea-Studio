/**
 * Flips Image Row blocks from the old `crop` default over to `natural`.
 *
 *   npm run payload -- run scripts/fix-gallery-fit.ts
 *   npm run payload -- run scripts/fix-gallery-fit.ts dry
 *
 * `crop` used to be the block's default, which meant Payload wrote it into
 * every row an editor never touched. It forces a 1080/2021 phone-portrait box
 * with `object-position: center top` — on a landscape photograph that keeps a
 * tall strip of the top third and discards about two thirds of the frame, which
 * on an interior shot is mostly ceiling. The default is now `natural`, but the
 * rows already saved carry the old value explicitly and have to be rewritten.
 *
 * Only rows still set to `crop` are touched. A row deliberately set to `crop`
 * for phone screenshots — which is what the mode is for — will be caught by
 * this too, so check the dry run before committing to it.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const args = process.argv.slice(2)
const dryRun = args.includes('dry')
// The collection autosaves drafts, so a document can hold two different answers
// at once. Public pages render the published version; `draft: true` reads the
// newer one. A fix applied to only one of them looks like it did nothing.
const readDraft = !args.includes('published')

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'case-studies',
  limit: 1000,
  depth: 0,
  draft: readDraft,
  pagination: false,
})

let changedDocs = 0
let changedRows = 0

for (const doc of docs) {
  const content = doc.content ?? []
  let touched = 0

  const next = content.map((block) => {
    if (block.blockType !== 'gallery') return block
    if (block.fit !== 'crop') return block
    touched++
    return { ...block, fit: 'natural' as const }
  })

  if (!touched) continue
  changedDocs++
  changedRows += touched

  console.log(`${dryRun ? '[dry] ' : ''}${doc.slug}: ${touched} image row(s) crop -> natural`)

  if (dryRun) continue

  await payload.update({
    collection: 'case-studies',
    id: doc.id,
    data: { content: next },
    // Matches how the document is stored — the seeded study is a draft, and
    // updating without this would publish it as a side effect of a CSS fix.
    draft: doc._status !== 'published',
  })
}

console.log(
  changedRows === 0
    ? 'Nothing to change — no image rows are set to crop.'
    : `${dryRun ? 'Would update' : 'Updated'} ${changedRows} row(s) across ${changedDocs} case stud${changedDocs === 1 ? 'y' : 'ies'}.`,
)

process.exit(0)
