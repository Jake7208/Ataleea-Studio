/**
 * Checks the Resend setup that Payload's own emails (password reset, account
 * verification) depend on, then optionally sends a real test message so Resend's
 * actual error surfaces instead of being swallowed.
 *
 *   node scripts/check-email.mjs                 # config check only
 *   node scripts/check-email.mjs you@example.com # ...and send a test email
 *
 * Never prints key or address values — only whether they're set and the shape
 * that matters (key prefix, from-address domain).
 */
import 'dotenv/config'
import { Resend } from 'resend'

const to = process.argv[2]
const KEY = process.env.RESEND_API_KEY
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS
const FROM_NAME = process.env.EMAIL_FROM_NAME
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

const ok = (s) => `  [ok]   ${s}`
const bad = (s) => `  [FAIL] ${s}`
const warn = (s) => `  [warn] ${s}`
const problems = []

console.log('\nPayload email configuration\n')

// ── RESEND_API_KEY ─────────────────────────────────────────────────────────
if (!KEY) {
  console.log(bad('RESEND_API_KEY is not set'))
  console.log(
    '         payload.config.ts leaves `email` undefined without it, so Payload\n' +
      '         falls back to logging emails to the server console. The admin UI\n' +
      '         still reports success and nothing is ever delivered.',
  )
  problems.push('RESEND_API_KEY missing')
} else if (!KEY.startsWith('re_')) {
  console.log(warn(`RESEND_API_KEY is set but does not start with "re_" (starts "${KEY.slice(0, 3)}…")`))
  problems.push('RESEND_API_KEY looks malformed')
} else {
  console.log(ok(`RESEND_API_KEY is set (re_…, ${KEY.length} chars)`))
}

// ── from address ───────────────────────────────────────────────────────────
const effectiveFrom = FROM_ADDRESS || 'onboarding@resend.dev'
if (!FROM_ADDRESS) {
  console.log(warn('EMAIL_FROM_ADDRESS is not set — falling back to onboarding@resend.dev'))
  console.log(
    '         Resend only delivers from onboarding@resend.dev to the address that\n' +
      '         owns the Resend account. Sending to any other recipient 403s, which\n' +
      "         is the usual reason a reset email never arrives.",
  )
  problems.push('EMAIL_FROM_ADDRESS not set')
} else {
  const domain = effectiveFrom.split('@')[1] ?? '(none)'
  console.log(ok(`EMAIL_FROM_ADDRESS is set (domain: ${domain})`))
  console.log(`         That domain must be verified in Resend → Domains, with its`)
  console.log(`         DKIM/SPF records live in DNS, or every send 403s.`)
}
console.log(FROM_NAME ? ok('EMAIL_FROM_NAME is set') : warn('EMAIL_FROM_NAME not set — defaults to the site name'))

// ── serverURL, which builds the link inside the email ──────────────────────
if (!SITE_URL) {
  console.log(warn('NEXT_PUBLIC_SITE_URL is not set — reset links will point at http://localhost:3000'))
  console.log('         Fine in dev. In production this must be set at BUILD time.')
} else {
  console.log(ok(`NEXT_PUBLIC_SITE_URL is set — reset links resolve against ${SITE_URL}`))
}

// ── live send ──────────────────────────────────────────────────────────────
if (!to) {
  console.log('\nPass a recipient to send a real test message:')
  console.log('  node scripts/check-email.mjs you@example.com\n')
} else if (!KEY) {
  console.log('\nSkipping the test send — no API key to send with.\n')
} else {
  console.log(`\nSending a test message to ${to} …`)
  const resend = new Resend(KEY)
  const { data, error } = await resend.emails.send({
    from: `"${FROM_NAME || 'Ataleea Studio'}" <${effectiveFrom}>`,
    to,
    subject: 'Ataleea Studio — email configuration test',
    html:
      '<p>If you are reading this, Payload can send password-reset emails.</p>' +
      `<p>Sent from <code>${effectiveFrom}</code>.</p>`,
  })

  if (error) {
    console.log(bad(`Resend rejected the send: ${error.name ?? 'error'}`))
    console.log(`         ${error.message}`)
    problems.push(`send failed: ${error.message}`)
  } else {
    console.log(ok(`Resend accepted the message (id ${data?.id})`))
    console.log('         Accepted is not delivered — check the inbox, then spam.')
  }
}

console.log(
  problems.length
    ? `\n${problems.length} problem(s): ${problems.join('; ')}\n`
    : '\nNo configuration problems found.\n',
)
process.exitCode = problems.length ? 1 : 0
