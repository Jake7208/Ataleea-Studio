/**
 * Answers the question "is there actually a database, and is my admin user in
 * it?" — the third thing that makes a password reset silently do nothing.
 *
 *   node scripts/check-db.mjs
 *
 * Talks to MongoDB directly rather than booting Payload, so it still reports
 * something useful when the connection itself is the problem. Read-only.
 */
import 'dotenv/config'
import mongoose from 'mongoose'

const URL = process.env.DATABASE_URL

if (!URL) {
  console.log('\n  [FAIL] DATABASE_URL is not set.')
  console.log('         Payload cannot start at all without it, so this is not just a')
  console.log('         password-reset problem — /admin would be erroring too.\n')
  process.exit(1)
}

// mongodb+srv://user:pass@cluster.x.mongodb.net/dbname -> host + db only
const redacted = URL.replace(/\/\/[^@]*@/, '//<credentials>@')
console.log(`\nDATABASE_URL: ${redacted}`)

const conn = await mongoose
  .createConnection(URL, { serverSelectionTimeoutMS: 8000 })
  .asPromise()
  .catch((err) => {
    console.log(`\n  [FAIL] Could not connect: ${err.message}`)
    console.log('         The cluster is unreachable, the credentials are wrong, or your')
    console.log('         IP is not on the Atlas access list. /admin would also be down.\n')
    process.exit(1)
  })

console.log(`  [ok]   Connected. Database in use: "${conn.name}"`)

const collections = await conn.db.listCollections().toArray()
console.log(`  [ok]   ${collections.length} collection(s): ${collections.map((c) => c.name).join(', ') || '(none)'}`)

const hasUsers = collections.some((c) => c.name === 'users')
if (!hasUsers) {
  console.log('\n  [FAIL] No "users" collection exists in this database.')
  console.log('         Nothing has ever been written here. Payload will show you the')
  console.log('         "create first user" screen at /admin — there is no account to')
  console.log('         reset, which is why the reset silently does nothing.')
  console.log('\n         If you expected users here, DATABASE_URL is pointing at the')
  console.log('         wrong database (a common one: prod vs local, or a typo in the')
  console.log('         /dbname segment of the connection string).\n')
  await conn.close()
  process.exit(1)
}

const users = await conn.db.collection('users').find({}, { projection: { email: 1, createdAt: 1 } }).toArray()

if (users.length === 0) {
  console.log('\n  [FAIL] The "users" collection exists but is empty.')
  console.log('         Go to /admin — Payload will offer to create the first user.')
  console.log('         A password reset has no account to act on.\n')
  await conn.close()
  process.exit(1)
}

console.log(`  [ok]   ${users.length} user account(s):`)
for (const u of users) {
  const when = u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : 'unknown date'
  console.log(`           ${u.email}  (created ${when})`)
}
console.log('\n  The database is fine and the account exists. A reset that produces no')
console.log('  email is then an email-delivery problem — run: pnpm check:email\n')

await conn.close()
