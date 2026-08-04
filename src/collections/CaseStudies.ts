import type { CollectionConfig } from 'payload'
import { revalidateFor } from '../lib/revalidate'
import { previewFor } from '../lib/preview'

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
      name: 'year',
      type: 'number',
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
          slug: 'text',
          labels: {
            singular: 'Text',
            plural: 'Text Blocks',
          },
          fields: [
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
          ],
        },
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
          ],
        },
        {
          slug: 'section',
          labels: {
            singular: 'Section Heading',
            plural: 'Section Headings',
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
              required: true,
              admin: { placeholder: 'e.g. A palette drawn from the materials' },
            },
            {
              name: 'body',
              type: 'textarea',
              admin: {
                description: 'Optional lead paragraph. Add Text blocks below for the rest.',
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
              name: 'faces',
              type: 'array',
              minRows: 1,
              required: true,
              labels: { singular: 'Typeface', plural: 'Typefaces' },
              fields: [
                {
                  name: 'family',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'e.g. Inter Tight' },
                },
                {
                  name: 'role',
                  type: 'text',
                  admin: { placeholder: 'e.g. Display — headings only' },
                },
                {
                  name: 'sample',
                  type: 'text',
                  admin: {
                    placeholder: 'AaBbCc 0123',
                    description:
                      'Shown large as the specimen. Leave blank to use the typeface name itself.',
                  },
                },
                {
                  name: 'notes',
                  type: 'text',
                  admin: { placeholder: 'e.g. Set at 500, tracked -2%' },
                },
              ],
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
              defaultValue: 'full',
              options: [
                { label: 'Full bleed — edge to edge', value: 'full' },
                { label: 'Framed — inset on a tinted panel', value: 'framed' },
              ],
              admin: {
                description:
                  'Photographs usually want full bleed. Screenshots want framing — a browser window running to the page edge reads as the page itself rather than as a picture of one.',
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
