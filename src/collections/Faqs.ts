import type { CollectionConfig } from 'payload'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'published', 'updatedAt'],
    description: 'Drag rows in this list to set the order they appear on the site.',
  },
  // drag-and-drop ordering in the admin list — the site sorts by this
  orderable: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: {
        description: 'Keep it to a short paragraph or two. Links are fine.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide this question from the site.',
      },
    },
  ],
}
