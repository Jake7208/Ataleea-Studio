import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'featured', 'updatedAt'],
    description: 'Drag rows in this list to set the order they appear on the site.',
  },
  // drag-and-drop ordering in the admin list — the site sorts by this
  orderable: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'e.g. "Team Lead — Acme Corp"',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'e.g. "Acme Corp"',
      },
    },
    {
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional company logo shown beside the quote.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'A photo of the person.',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Only featured testimonials show on the site.',
      },
    },
  ],
}
