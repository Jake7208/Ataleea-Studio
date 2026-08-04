import type { Access, CollectionConfig } from 'payload'

/** Only signed-in editors may add or change files; reading is public. */
const editorsOnly: Access = ({ req }) => Boolean(req.user)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    // Without this the list view labels every row with its Mongo id. Alt text is
    // required on every upload, so it always has something to show.
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'tags', 'featured', 'updatedAt'],
    group: 'Library',
    description:
      'Every image and video on the site lives here. Upload once, then point a case study, journal post or page slot at it.',
  },
  access: {
    read: () => true,
    create: editorsOnly,
    update: editorsOnly,
    delete: editorsOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'What the picture shows, in a sentence — read aloud by screen readers and shown if the file fails to load.',
        placeholder: 'e.g. Finished timber-framed extension, shot from the garden',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Tagged images appear in the site gallery, filterable by tag.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'The most recently updated featured photo fills the full-width gallery band on the homepage.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Shown next to the image in the gallery lightbox.',
      },
    },
    {
      name: 'dateTaken',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'When the photo was taken — shown in the gallery lightbox.',
      },
    },
  ],
  upload: {
    // Nothing on the site renders a PDF or a zip, so keep them out of the picker
    // rather than letting one land in a collection that can't display it.
    mimeTypes: ['image/*', 'video/*'],
    // Payload core builds string-based adminThumbnail URLs against its own
    // /api/media/file route, which is disabled when files are served straight
    // from R2 — so build the public URL from the stored filename instead.
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as { thumbnail?: { filename?: string | null } } | undefined
      const filename = sizes?.thumbnail?.filename || (doc?.filename as string | undefined)
      if (!filename) return null
      const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')
      return base
        ? `${base}/${encodeURIComponent(filename)}`
        : `/api/media/file/${encodeURIComponent(filename)}`
    },
    // Focal point decides what stays in frame when a slot crops; crop lets an
    // editor trim the source itself when the shot needs it.
    focalPoint: true,
    crop: true,
    // Show the picked image inline on every `upload` field rather than a filename.
    displayPreview: true,
    // Camera originals run 6000px+ and nothing here renders past 2048. Capping the
    // stored original keeps R2 from filling with pixels no visitor ever receives —
    // raise or drop this if you need the untouched file back out of the CMS.
    resizeOptions: { width: 2560, withoutEnlargement: true },
    // Widths, not boxes — every size keeps the source's aspect ratio, so they can
    // all sit in one srcSet together (see lib/media.ts). webp on the derivatives
    // only; the original is left untouched as the download/fallback copy.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'medium',
        width: 900,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'large',
        width: 1440,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      {
        name: 'xlarge',
        width: 2048,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 76 } },
      },
    ],
  },
}
