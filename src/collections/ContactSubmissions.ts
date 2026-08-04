import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'

import { CONTACT_TOPICS } from '@/lib/contact-topics'
import { assertHuman } from '@/lib/turnstile'

const TOPIC_LABELS: Record<string, string> = Object.fromEntries(
  CONTACT_TOPICS.map(({ value, label }) => [value, label]),
)

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact Submission',
    plural: 'Contact Submissions',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'topic', 'createdAt'],
    group: 'Inbox',
  },
  access: {
    // anyone can submit; only logged-in users can read/manage
    create: () => true,
  },
  hooks: {
    // create is open to the public, so prove it's a person before anything is
    // written — throwing here rejects the request without saving
    beforeValidate: [
      async ({ operation, req }) => {
        if (operation === 'create') await assertHuman(req)
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
          req.payload.logger.warn(
            'RESEND_API_KEY / CONTACT_TO_EMAIL not set — skipping contact notification email',
          )
          return
        }

        const topic = doc.topic ? (TOPIC_LABELS[doc.topic] ?? doc.topic) : 'Not specified'

        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error } = await resend.emails.send({
            from: process.env.CONTACT_FROM_EMAIL || 'Website <onboarding@resend.dev>',
            to: process.env.CONTACT_TO_EMAIL,
            replyTo: doc.email,
            subject: `New contact message from ${doc.name}`,
            html: `
              <h2>New contact form submission</h2>
              <p><strong>Name:</strong> ${escapeHtml(doc.name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(doc.email)}</p>
              <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(doc.message).replace(/\n/g, '<br />')}</p>
            `,
            text: `New contact form submission\n\nName: ${doc.name}\nEmail: ${doc.email}\nTopic: ${topic}\n\n${doc.message}`,
          })
          if (error) {
            req.payload.logger.error({ err: error }, 'Resend rejected contact notification email')
          }
        } catch (err) {
          // the submission is already saved — never fail the request over the email
          req.payload.logger.error({ err }, 'Failed to send contact notification email')
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'topic',
      type: 'select',
      // shared with the front-end form so the two can never drift apart —
      // a value the select doesn't list is rejected on create
      options: CONTACT_TOPICS.map(({ value, label }) => ({ value, label })),
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
  ],
}
