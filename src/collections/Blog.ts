import type { CollectionConfig } from 'payload'

import { siteConfig } from '../site.config'
import { revalidateFor } from '../lib/revalidate'
import { previewFor } from '../lib/preview'

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
    group: 'Content',
    preview: previewFor('/newsroom'),
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: revalidateFor({ paths: ['/newsroom'], detail: (slug) => `/newsroom/${slug}` }),
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
      // What the post IS. Prints on the card chip and above the headline, and
      // it is a property of the post rather than something read out of the tag
      // list — see the note in lib/news.ts for what that inference cost.
      name: 'kind',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'News', value: 'news' },
        { label: 'Press release', value: 'press-release' },
      ],
      defaultValue: 'article',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The label on the card and above the headline.',
      },
    },
    {
      // What the post is ABOUT. Drives the filter on the newsroom index, which
      // lists only the topics that published posts actually carry — this
      // collection is shared with case studies and the media library, and their
      // tags have no business in a news filter.
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Topics',
      admin: {
        position: 'sidebar',
        description: 'Subjects the post covers. These are the filter tabs on the newsroom.',
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
