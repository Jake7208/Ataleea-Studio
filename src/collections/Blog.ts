import type { CollectionConfig } from 'payload'

import { siteConfig } from '../site.config'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Blog: CollectionConfig = {
  slug: 'blog',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedAt', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    // the public only sees published posts; logged-in users see everything
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
      name: 'author',
      type: 'text',
      defaultValue: siteConfig.author,
      admin: {
        position: 'sidebar',
        description: 'Shown as “Written by …” on the post.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Categories',
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
      name: 'mainMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image / Video',
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body',
      admin: {
        description: 'The post itself — headings, text, images and video all live here.',
      },
    },
  ],
}
