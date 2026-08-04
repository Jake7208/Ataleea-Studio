import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Leaves draft mode.
 *
 * Worth having a real exit rather than relying on the cookie expiring: while
 * draft mode is on you are served unpublished content everywhere on the site,
 * which makes it easy to check something, wander off, and later mistake a draft
 * for what the public can see.
 */
export async function GET(req: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  const back = new URL(req.url).searchParams.get('path')
  redirect(back && back.startsWith('/') && !back.startsWith('//') ? back : '/')
}
