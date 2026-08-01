import type { CollectionConfig } from 'payload'

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
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
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
              name: 'caption',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
