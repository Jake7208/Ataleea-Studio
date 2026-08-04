import { APIError } from 'payload'
import type { PayloadRequest } from 'payload'

import { TURNSTILE_HEADER } from '@/lib/turnstile-header'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Guards a publicly-creatable collection with Cloudflare Turnstile.
 *
 * Inert until TURNSTILE_SECRET_KEY is set, matching how the Resend integration
 * behaves — a fresh checkout still has working forms. Once the key is present
 * it fails closed: a missing, invalid, or unverifiable token is rejected rather
 * than waved through, since the whole point is that the endpoint is open.
 *
 * Requests from a logged-in user are skipped. Those come from the admin panel,
 * which has no widget to solve and is already behind auth.
 */
export async function assertHuman(req: PayloadRequest): Promise<void> {
  if (req.user) return

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    req.payload.logger.warn(
      'TURNSTILE_SECRET_KEY not set — accepting a public submission without verification',
    )
    return
  }

  const token = req.headers?.get(TURNSTILE_HEADER)
  if (!token) {
    throw new APIError('Please complete the verification and try again.', 403)
  }

  const body = new URLSearchParams({ secret, response: token })
  // set by Cloudflare in front of the app; ties the token to the solver's IP
  const ip = req.headers?.get('cf-connecting-ip')
  if (ip) body.set('remoteip', ip)

  let verified = false
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body })
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    verified = data.success === true
    if (!verified) {
      req.payload.logger.warn(
        { codes: data['error-codes'] },
        'Turnstile rejected a public submission',
      )
    }
  } catch (err) {
    req.payload.logger.error({ err }, 'Could not reach Turnstile to verify a submission')
    throw new APIError('Could not verify that just now. Please try again in a moment.', 503)
  }

  if (!verified) {
    throw new APIError('Verification failed. Please try again.', 403)
  }
}
