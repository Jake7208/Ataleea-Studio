import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { siteConfig } from './site.config'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Blog } from './collections/Blog'
import { CaseStudies } from './collections/CaseStudies'
import { Tags } from './collections/Tags'
import { Testimonials } from './collections/Testimonials'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Comments } from './collections/Comments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, CaseStudies, Blog, Tags, Testimonials, ContactSubmissions, Comments],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  // Powers the emails Payload sends on its own: admin password resets and account
  // verification. (The contact form doesn't go through here — it calls Resend
  // directly from the ContactSubmissions afterChange hook.) Without a key we leave
  // `email` unset so Payload keeps logging messages to the console rather than
  // handing Resend an empty key and failing at send time.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        defaultFromName: process.env.EMAIL_FROM_NAME || siteConfig.name,
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
  sharp,
  plugins: [
    // With no bucket configured, uploads fall back to the local filesystem —
    // fine for development, set the R2_* vars before deploying.
    ...(process.env.R2_BUCKET
      ? [
          s3Storage({
            collections: {
              // With a public bucket URL configured, files are served straight from
              // R2/CDN instead of being proxied through this server on every request.
              media: process.env.R2_PUBLIC_URL
                ? {
                    disablePayloadAccessControl: true,
                    generateFileURL: ({ filename, prefix }) =>
                      [process.env.R2_PUBLIC_URL!.replace(/\/+$/, ''), prefix, filename]
                        .filter(Boolean)
                        .join('/'),
                  }
                : true,
            },
            bucket: process.env.R2_BUCKET || '',
            config: {
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
              },
              region: 'auto',
              endpoint:
                process.env.R2_ENDPOINT ||
                (process.env.R2_ACCOUNT_ID
                  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
                  : ''),
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})
