import type { CollectionConfig } from 'payload'
import { revalidateFor } from '../lib/revalidate'
import { previewFor } from '../lib/preview'
import { DEFAULT_DEVICE, deviceOptions } from '../lib/devices'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: 'Case Study',
    plural: 'Case Studies',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'year', 'publishedAt', 'updatedAt'],
    group: 'Content',
    preview: previewFor('/work'),
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: revalidateFor({ paths: ['/', '/work'], detail: (slug) => `/work/${slug}` }),
  access: {
    // the public only sees published case studies; logged-in users see everything
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Leave blank to generate from the title.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.title === 'string' ? slugify(data.title) : value),
        ],
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short teaser shown on cards and used as the SEO description.',
      },
    },
    {
      name: 'roles',
      type: 'text',
      label: 'Roles / Services',
      admin: {
        placeholder: 'e.g. Design & Development',
      },
    },
    {
      name: 'collaborators',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g. Design',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g. Jane Doe',
          },
        },
      ],
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        placeholder: 'e.g. San Francisco, CA',
      },
    },
    {
      name: 'accentColor',
      type: 'text',
      label: 'Accent Color (Hex)',
      admin: {
        position: 'sidebar',
        placeholder: '#e0d4c3',
        description: 'Custom brand color for tinted sections (Dennis Snellenberg style).',
      },
    },
    {
      name: 'year',
      type: 'number',
    },
    {
      name: 'liveUrl',
      type: 'text',
      label: 'Live site URL',
      admin: {
        placeholder: 'https://example.com',
        description:
          'Adds a “Visit the site” button to the header. Leave blank if the site is not public yet.',
      },
      // Ends up in an href, so the protocol is pinned to http(s) here and
      // checked again at render — a `javascript:` URL is a script, not a link.
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Enter a URL.'
        try {
          const { protocol } = new URL(value.trim())
          return protocol === 'http:' || protocol === 'https:'
            ? true
            : 'Use an http:// or https:// URL.'
        } catch {
          return 'Enter a full URL, e.g. https://example.com'
        }
      },
    },
    {
      name: 'mainMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Main Image / Video',
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
        {
          slug: 'statement',
          labels: {
            singular: 'Statement',
            plural: 'Statements',
          },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'One sentence, set large — the point of the project rather than a description of it. Use sparingly; two or three in a case study is plenty.',
              },
            },
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'dark',
              options: [
                { label: 'Dark panel', value: 'dark' },
                { label: 'Tinted panel', value: 'tinted' },
                { label: 'Plain — sits on the page', value: 'plain' },
              ],
              admin: {
                description:
                  'A statement on a dark band is the strongest break the page has. That is most of what it is for.',
              },
            },
          ],
        },
        {
          // Text and Section Heading used to be two blocks that differed only by
          // whether a heading sat above the paragraph. One block with an optional
          // heading covers both cases, so the choice stops being the editor's to
          // make. The slug stays `section` so studies already using it keep their
          // headings; older `text` blocks are read by ArticleBody as a fallback.
          slug: 'section',
          labels: {
            singular: 'Text',
            plural: 'Text Blocks',
          },
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              admin: {
                placeholder: 'e.g. 02 — Colour',
                description: 'Optional kicker above the heading. Numbering them helps a long study.',
              },
            },
            {
              name: 'heading',
              type: 'text',
              admin: {
                placeholder: 'e.g. A palette drawn from the materials',
                description: 'Optional. Leave it blank for a plain paragraph.',
              },
            },
            {
              name: 'body',
              type: 'textarea',
              required: true,
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              label: 'Image (optional)',
              admin: {
                description:
                  'Sits in the content column under the copy, so the text stops owning a full screen of scroll on its own.',
              },
            },
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Plain — sits on the page', value: 'default' },
                { label: 'Tinted panel', value: 'tinted' },
                { label: 'Dark panel', value: 'dark' },
              ],
              admin: {
                description:
                  'Paints a full-width band behind this section. A Colour System, Typography or Testimonial block placed directly below joins the same band, so set the tone here rather than expecting those to carry their own. Two or three panels down a long study is what stops it reading as one unbroken column — every section on a panel is the same problem again.',
              },
            },
          ],
        },
        {
          slug: 'palette',
          labels: {
            singular: 'Colour System',
            plural: 'Colour Systems',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                placeholder: 'e.g. Colour',
                description:
                  'One word, shown quietly in the left column. Leave blank if a Text block above already introduces the palette.',
              },
            },
            {
              name: 'swatches',
              type: 'array',
              minRows: 2,
              required: true,
              labels: { singular: 'Colour', plural: 'Colours' },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'e.g. Forest' },
                },
                {
                  name: 'hex',
                  type: 'text',
                  required: true,
                  admin: { placeholder: '#0F2D2B' },
                  // Rendered straight into an inline style, so it must be a
                  // colour and nothing else — see the note in ArticleBody.
                  validate: (value: unknown) =>
                    typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
                      ? true
                      : 'Enter a hex colour, e.g. #0F2D2B',
                },
                {
                  name: 'usage',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g. Headings and the primary button',
                    description: 'What the colour is for. This is the part clients actually read.',
                  },
                },
              ],
            },
          ],
        },
        {
          slug: 'typeSpecimen',
          labels: {
            singular: 'Typography',
            plural: 'Typography',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                placeholder: 'Typography',
                description: 'One word, shown quietly in the left column. Defaults to “Typography”.',
              },
            },
            {
              name: 'images',
              type: 'array',
              maxRows: 2,
              label: 'Specimen images (optional)',
              labels: { singular: 'Specimen', plural: 'Specimens' },
              admin: {
                description:
                  'Replaces the live specimen below. Use this whenever the project’s typeface is not one this site loads — which is most of them. Export SVG with the text outlined, not PNG: it stays crisp at any size and needs no font to render. Two sit side by side, which is how you show a display face against the text face it is paired with.',
              },
              fields: [
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g. Display — Inter Tight',
                    description: 'Optional caption under the specimen. Names the face it shows.',
                  },
                },
              ],
            },
            {
              name: 'faces',
              type: 'array',
              minRows: 0,
              labels: { singular: 'Typeface', plural: 'Typefaces' },
              admin: {
                condition: (_, siblingData) => !siblingData?.images?.length,
                description:
                  'Only renders the real letterforms if this site already loads the face. Otherwise it falls back to the site’s own type and quietly shows the wrong thing — use the image above instead.',
              },
              fields: [
                {
                  name: 'family',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'e.g. Inter Tight' },
                },
                {
                  name: 'sample',
                  type: 'text',
                  admin: {
                    placeholder: 'Aa',
                    description:
                      'The showcase line, set enormous in the face itself. “Aa” is the default and usually the right answer — a word or two works, a sentence does not.',
                  },
                },
                {
                  name: 'notes',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g. Headings only, set at 500',
                    description: 'A footnote beside the family name. Keep it to a few words.',
                  },
                },
              ],
            },
          ],
        },
        {
          slug: 'testimonial',
          labels: {
            singular: 'Testimonial',
            plural: 'Testimonials',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                placeholder: 'e.g. Testimonial',
                description: 'One word, shown quietly in the left column.',
              },
            },
            {
              name: 'quote',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'In their words, not yours. A quote you wrote on a client’s behalf reads like one, and this is the block a sceptical reader weighs hardest.',
              },
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { placeholder: 'e.g. Maria Cruz' },
            },
            {
              name: 'role',
              type: 'text',
              admin: { placeholder: 'e.g. Owner' },
            },
            {
              name: 'company',
              type: 'text',
              admin: { placeholder: 'e.g. MC Remodeling' },
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional headshot. A face makes an attribution harder to discount.',
              },
            },
          ],
        },
        {
          slug: 'mediaBlock',
          labels: {
            singular: 'Media',
            plural: 'Media Blocks',
          },
          fields: [
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'display',
              type: 'select',
              defaultValue: 'wide',
              options: [
                { label: 'Wide — aligned with the page margins', value: 'wide' },
                { label: 'Full bleed — edge to edge', value: 'full' },
                { label: 'Framed — inset on a tinted panel', value: 'framed' },
              ],
              admin: {
                description:
                  'Wide is the working setting: it shares its left and right edge with the title, the copy and the swatches, so the page holds one column. Full bleed is a deliberate break — use it once or twice for the shot that deserves it. A page of near-but-not-quite widths reads as a misalignment rather than as rhythm.',
              },
            },
            {
              name: 'playback',
              type: 'select',
              defaultValue: 'ambient',
              label: 'Playback (video only)',
              options: [
                { label: 'Ambient — plays itself, silent, on a loop', value: 'ambient' },
                { label: 'Player — a still with controls, reader presses play', value: 'player' },
              ],
              admin: {
                description:
                  'Ignored for stills. Ambient plays whenever the clip is on screen, pauses when it is not, and takes no clicks — so it reads as part of the page rather than as something to operate. Keep those short and silent. Use Player for anything with narration or longer than about twenty seconds, since a clip a reader cannot pause is one they cannot finish.',
              },
            },
            {
              name: 'caption',
              type: 'text',
            },
          ],
        },
        {
          slug: 'deviceMockup',
          labels: {
            singular: 'Device Mockup',
            plural: 'Device Mockups',
          },
          fields: [
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Screen content',
              admin: {
                description:
                  'What shows through the display. Export it at the device’s own proportions — the picker below names the exact pixel size — and it lands in the cutout without cropping. A video here autoplays and loops like any other ambient clip, which is what a scrolling screen recording wants.',
              },
            },
            {
              name: 'device',
              type: 'select',
              defaultValue: DEFAULT_DEVICE,
              options: deviceOptions,
              admin: {
                description:
                  '16-inch is 3456 × 2234; 14-inch is 3024 × 1964. Both are 3:2-ish rather than 16:9, so a 1920 × 1080 export will be cropped top and bottom to fit.',
              },
            },
            {
              name: 'screenFit',
              type: 'select',
              defaultValue: 'top',
              label: 'How the artwork sits in the screen',
              options: [
                { label: 'Fit the width, start at the top', value: 'top' },
                { label: 'Fill the screen — trims to fit', value: 'cover' },
                { label: 'Show all of it — letterboxed', value: 'contain' },
              ],
              admin: {
                description:
                  'The default suits a full-page screenshot: it matches the display’s width, starts at the top and lets the bezel clip the rest, which is how a site on a laptop actually looks. Use Fill only for artwork exported at the display’s exact size — anything else loses its edges. None of the three ever stretches the image.',
              },
            },
            {
              name: 'screenColor',
              type: 'text',
              label: 'Screen background (hex, optional)',
              admin: {
                placeholder: '#FBFAF6',
                description:
                  'Fills whatever the artwork leaves over. The display is roughly 3:2 and a screenshot rarely is, so setting this to the page’s own background colour turns the leftover strip into the page continuing rather than a gap under it. Pick the colour out of the screenshot itself — matched exactly, the join is invisible.',
              },
              validate: (value: unknown) => {
                if (!value) return true
                return typeof value === 'string' &&
                  /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
                  ? true
                  : 'Enter a hex colour, e.g. #FBFAF6'
              },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'large',
              label: 'Size on the page',
              options: [
                { label: 'Large — fills most of the column', value: 'large' },
                { label: 'Full — the whole content width', value: 'full' },
                { label: 'Medium', value: 'medium' },
                { label: 'Small', value: 'small' },
              ],
              admin: {
                description:
                  'Height follows from this — the laptop’s proportions are fixed — so there is no separate height to set. Large is the working setting; drop to Medium only when two mockups sit near each other and the second should not shout as loud as the first.',
              },
            },
            {
              name: 'display',
              type: 'select',
              defaultValue: 'wide',
              options: [
                { label: 'Wide — aligned with the page margins', value: 'wide' },
                { label: 'Full bleed — edge to edge', value: 'full' },
              ],
            },
            {
              name: 'background',
              type: 'text',
              label: 'Panel colour (hex, optional)',
              admin: {
                placeholder: '#E6E8EB',
                description:
                  'Paints a band behind the device so it sits on a surface instead of floating on the page. A colour pulled from the screenshot itself is usually the right one.',
              },
              validate: (value: unknown) => {
                if (!value) return true
                return typeof value === 'string' &&
                  /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
                  ? true
                  : 'Enter a hex colour, e.g. #E6E8EB'
              },
            },
            {
              name: 'caption',
              type: 'text',
            },
          ],
        },
        {
          slug: 'gallery',
          labels: {
            singular: 'Image Row',
            plural: 'Image Rows',
          },
          fields: [
            {
              name: 'images',
              type: 'array',
              minRows: 2,
              maxRows: 4,
              required: true,
              labels: { singular: 'Image', plural: 'Images' },
              fields: [
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g. Desktop',
                    description:
                      'Optional tag under the image. This is how you pair a desktop and a mobile shot in one row.',
                  },
                },
              ],
            },
            {
              name: 'fit',
              type: 'select',
              defaultValue: 'natural',
              options: [
                { label: 'Keep each image’s own shape', value: 'natural' },
                { label: 'Crop to a matching shape', value: 'crop' },
              ],
              admin: {
                description:
                  'Photographs want cropping — a row of matching shapes reads as one set. Screenshots do not: cropping a phone screen to a photo’s proportions cuts the top and bottom off the thing you are trying to show. Use “keep” for device shots and mockups.',
              },
            },
            {
              name: 'caption',
              type: 'text',
              admin: {
                description: 'Optional — describes the row as a whole.',
              },
            },
          ],
        },
      ],
    },
  ],
}
