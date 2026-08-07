import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

import { assertHuman } from '@/lib/turnstile'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Newsletter list.
 *
 * The list lives here rather than in a sending provider, and that is the whole
 * decision: whoever the newsletter is eventually sent with, the addresses are
 * already ours and moving providers is an export rather than a migration.
 * Sending is a separate job done monthly from a tool that owns the unsubscribe
 * link and the List-Unsubscribe header — those are the parts worth renting, and
 * neither of them is a reason to let someone else hold the list.
 *
 * `subscribedAt` and `source` are not decoration: they are the record of when
 * and where consent was given, which is what you want to be able to produce if
 * anyone ever asks.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: 'Subscriber',
    plural: 'Subscribers',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'source', 'subscribedAt'],
    group: 'Inbox',
  },
  // Access is left at the default (authenticated only) on every operation,
  // including create — the public route in is the /subscribe endpoint below,
  // which runs its own checks. Leaving `create` closed here means the generated
  // REST endpoint cannot be used to write straight into the list, while an
  // admin can still add someone by hand.
  endpoints: [
    {
      path: '/subscribe',
      method: 'post',
      handler: async (req) => {
        // throws on a missing or bad token; inert until the secret is set,
        // exactly as it is for contact submissions
        await assertHuman(req)

        const body = (await req.json?.()) ?? {}
        const email = String(body.email ?? '')
          .trim()
          .toLowerCase()

        if (!EMAIL_RE.test(email)) {
          throw new APIError('Please enter a valid email address.', 400)
        }

        const source = typeof body.source === 'string' ? body.source.slice(0, 60) : 'footer'
        const now = new Date().toISOString()

        const existing = await req.payload.find({
          collection: 'subscribers',
          where: { email: { equals: email } },
          limit: 1,
          req,
        })

        const current = existing.docs[0]

        // Deliberately using the Local API's default overrideAccess: this
        // endpoint is the gate, and it has already run the checks the closed
        // collection access would have run.
        if (!current) {
          await req.payload.create({
            collection: 'subscribers',
            data: { email, status: 'subscribed', source, subscribedAt: now },
            req,
          })
        } else if (current.status !== 'subscribed') {
          // Someone coming back after unsubscribing. Re-subscribing is the
          // thing they just asked for, so honour it rather than telling them
          // they are already on a list they took themselves off.
          await req.payload.update({
            collection: 'subscribers',
            id: current.id,
            data: { status: 'subscribed', subscribedAt: now },
            req,
          })
        }

        // The same response whether the address was new, returning, or already
        // subscribed. Anything else turns this into a way to ask the site
        // whether it holds a given email.
        return Response.json({ ok: true })
      },
    },
  ],
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'subscribed',
      options: [
        { value: 'subscribed', label: 'Subscribed' },
        { value: 'unsubscribed', label: 'Unsubscribed' },
      ],
      admin: {
        description:
          'Set to Unsubscribed rather than deleting the record, so the address is not silently re-added by a later import.',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Where the sign-up came from.',
      },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When consent was given. Kept as the record of it.',
      },
    },
  ],
}

export default Subscribers
