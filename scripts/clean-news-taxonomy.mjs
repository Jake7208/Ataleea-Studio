/**
 * One-off: move "what kind of post is this" off the tag list and onto the post,
 * then clear out what that leaves behind.
 *
 * Before, a newsroom card printed the name of whichever tag was typed
 * `category`, and the literal word "News" if the post had none. The database
 * grew a tag called "Article" (typed news-tag) and one called "Articles" (typed
 * category) as a result, and a post carrying the first printed NEWS while a post
 * carrying the second printed ARTICLES.
 *
 * Four passes, each one skipped if there is nothing left for it to do, so the
 * script is safe to run twice:
 *
 *   1. `kind` set on every post that has none. Everything in the newsroom today
 *      is an article; `news` and `press-release` are there for later.
 *   2. Versions brought along, since a version missing a required field would
 *      fail validation the moment an editor restored it.
 *   3. The kind-shaped tags detached from posts. They described what a post is,
 *      and what a post is now has a field.
 *   4. Those tags deleted, but ONLY once nothing anywhere references them — the
 *      collection is shared with case studies and the media library, and a name
 *      being useless to the newsroom says nothing about the other two. Anything
 *      still in use is reported and left alone.
 *
 * Also strips the dead `type` key that the tags collection no longer declares.
 * Mongo keeps whatever it was last given, so without this the field sits in
 * every old tag document forever, invisible to Payload and confusing to anyone
 * reading the collection directly.
 *
 * Writes through the driver rather than the local API so the versions can be
 * brought along in the same pass, and so a document that is currently invalid
 * (there is an untitled draft) does not stop the run. Nothing here touches a
 * field Payload computes.
 *
 *   node scripts/clean-news-taxonomy.mjs           # report only
 *   node scripts/clean-news-taxonomy.mjs --write   # apply
 */
import 'dotenv/config'
import { MongoClient } from 'mongodb'

const WRITE = process.argv.includes('--write')

/** Tags that named a post's kind rather than its subject. */
const KIND_TAG_NAMES = ['Article', 'Articles']

/** Every collection whose documents can hold a tag reference. */
const TAG_CONSUMERS = ['blogs', 'case-studies', 'media']

const client = new MongoClient(process.env.DATABASE_URL)
await client.connect()
const db = client.db()

const say = (line) => console.log(line)
const plan = { posts: [], versions: 0, detach: [], remove: [], keep: [], stripType: 0 }

// ── 1 + 3. posts ───────────────────────────────────────────────────────────
const kindTags = await db
  .collection('tags')
  .find({ name: { $in: KIND_TAG_NAMES } })
  .toArray()
const kindTagIds = new Set(kindTags.map((t) => String(t._id)))

for (const post of await db.collection('blogs').find({}).toArray()) {
  const set = {}
  if (!post.kind) set.kind = 'article'

  const kept = (post.tags ?? []).filter((t) => !kindTagIds.has(String(t)))
  if (kept.length !== (post.tags ?? []).length) set.tags = kept

  if (Object.keys(set).length) {
    plan.posts.push({ id: post._id, label: post.title || `(untitled ${post._id})`, set })
  }
}

plan.versions = await db
  .collection('_blog_versions')
  .countDocuments({ 'version.kind': { $exists: false } })

// ── 4. tags ────────────────────────────────────────────────────────────────
for (const tag of kindTags) {
  const uses = {}
  for (const collection of TAG_CONSUMERS) {
    // Count what would still reference it after pass 3, not what does now.
    const filter =
      collection === 'blogs'
        ? { tags: tag._id, _id: { $nin: plan.posts.map((p) => p.id) } }
        : { tags: tag._id }
    const count = await db.collection(collection).countDocuments(filter)
    if (count) uses[collection] = count
  }
  if (Object.keys(uses).length) plan.keep.push({ name: tag.name, uses })
  else plan.remove.push({ id: tag._id, name: tag.name })
}

plan.stripType = await db.collection('tags').countDocuments({ type: { $exists: true } })

// ── report ─────────────────────────────────────────────────────────────────
say('Posts')
for (const { label, set } of plan.posts) {
  const changes = []
  if (set.kind) changes.push(`kind → ${set.kind}`)
  if (set.tags) changes.push('detach kind-shaped tag')
  say(`  ${label}: ${changes.join(', ')}`)
}
if (!plan.posts.length) say('  nothing to change')

say(`\nVersions\n  ${plan.versions} missing kind`)

say('\nTags')
for (const { name } of plan.remove) say(`  delete “${name}” — referenced by nothing`)
for (const { name, uses } of plan.keep) {
  say(`  keep “${name}” — still used by ${JSON.stringify(uses)}`)
}
if (!plan.remove.length && !plan.keep.length) say('  no kind-shaped tags left')
say(`  strip dead \`type\` key from ${plan.stripType} tag(s)`)

// ── apply ──────────────────────────────────────────────────────────────────
if (!WRITE) {
  say('\nDry run. Re-run with --write to apply.')
} else {
  for (const { id, set } of plan.posts) {
    await db.collection('blogs').updateOne({ _id: id }, { $set: set })
  }
  const versions = await db
    .collection('_blog_versions')
    .updateMany({ 'version.kind': { $exists: false } }, { $set: { 'version.kind': 'article' } })

  if (plan.remove.length) {
    const ids = plan.remove.map((t) => t.id)
    // Belt and braces: pull the ids out of every consumer before dropping the
    // documents, so nothing is left pointing at a tag that no longer exists.
    for (const collection of TAG_CONSUMERS) {
      await db.collection(collection).updateMany({ tags: { $in: ids } }, { $pull: { tags: { $in: ids } } })
    }
    await db
      .collection('_blog_versions')
      .updateMany({ 'version.tags': { $in: ids } }, { $pull: { 'version.tags': { $in: ids } } })
    await db.collection('tags').deleteMany({ _id: { $in: ids } })
  }

  await db.collection('tags').updateMany({ type: { $exists: true } }, { $unset: { type: '' } })

  say(
    `\nUpdated ${plan.posts.length} post(s) and ${versions.modifiedCount} version(s); ` +
      `deleted ${plan.remove.length} tag(s).`,
  )
}

await client.close()
