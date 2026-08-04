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
import { Faqs } from './collections/Faqs'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Comments } from './collections/Comments'
import { SiteMedia } from './globals/SiteMedia'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Ataleea's marks in place of Payload's: the wordmark on the login screen,
    // the mark alone in the sidebar. Styling for both is in (payload)/custom.scss.
    components: {
      graphics: {
        Logo: '/components/admin/Graphics#AdminLogo',
        Icon: '/components/admin/Graphics#AdminIcon',
      },
    },
    meta: {
      titleSuffix: ` · ${siteConfig.name}`,
      description: `Content management for ${siteConfig.name}.`,
      // The tab icon comes from src/app/icon.svg, which Next applies to every
      // route in the app — no `icons` entry needed here.
      //
      // Nothing behind a login should be indexable. This is the whole of that
      // instruction — robots.ts deliberately does NOT name the admin path,
      // since robots.txt is public and listing it there would undo the move
      // off /admin. See the comment in src/app/robots.ts.
      robots: 'noindex, nofollow',
      // Payload otherwise renders a share card per admin page through /api/og.
      // Nobody shares a link to a CMS they're the only user of, so the endpoint
      // is dead weight — turning it off closes it.
      defaultOGImageType: 'off',
    },
  },
  // The admin panel does NOT live at /admin. That path is the first thing every
  // scanner tries, and moving it off the list cuts the background noise in the
  // logs to nothing — it is not a substitute for the login lockout on the Users
  // collection, which is what actually stops a determined attempt.
  //
  // This has to stay in step with the folder it's served from:
  // src/app/(payload)/studio/. `payload generate:importmap` also resolves its
  // output path from this value, so changing one without the other breaks both.
  routes: {
    admin: '/studio',
  },
  collections: [
    Users,
    Media,
    CaseStudies,
    Blog,
    Tags,
    Testimonials,
    Faqs,
    ContactSubmissions,
    Comments,
  ],
  globals: [SiteMedia],
  editor: lexicalEditor(),
  // Every absolute URL Payload builds for itself starts here — the reset-password
  // and verification links above all. Left unset it defaults to '', and because
  // the request-origin fallback only trusts hosts already in the cors/csrf
  // allowlist (both empty by default), it stays '' and the links come out as bare
  // paths like /admin/reset/<token>, which are dead in an email client.
  // Same value the front end uses, so dev gets localhost and production gets the
  // real origin from NEXT_PUBLIC_SITE_URL.
  serverURL: siteConfig.url,
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
