import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Turns on Next's draft mode, then sends you to the page you asked for.
 *
 * Draft mode is what makes the detail pages query unpublished content, so this
 * route is the gate in front of it — anything that gets past here can read work
 * that hasn't been published.
 *
 * The gate is the Payload session itself: `payload.auth` reads the same
 * httpOnly cookie the admin panel logs you in with, and the admin and the site
 * are the same origin, so it travels with the request on its own. That is
 * deliberately not a shared secret in the query string — a secret in a URL ends
 * up in browser history, in the referrer header of anything the previewed page
 * loads, and in any screenshot of the address bar. A session cookie does not.
 */
export async function GET(req: Request): Promise<Response> {
  const path = new URL(req.url).searchParams.get('path')

  // Must be a site-relative path. The `//` case matters: `//evil.example` is a
  // protocol-relative URL, so without it this redirects off-site for anyone who
  // can get an admin to click a crafted link.
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path.', { status: 400 })
  }

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return new Response('Sign in to the admin panel to preview drafts.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  // redirect() signals by throwing, so it has to be the last thing here and
  // must not sit inside a try/catch.
  redirect(path)
}
