import type { CollectionConfig } from 'payload'

/**
 * Subjects, shared by newsroom posts and case studies.
 *
 * There was a `type` select here — Category or News Tag — which existed so the
 * newsroom card could pick one tag out of the list to print on its chip. That
 * made the taxonomy carry two unrelated jobs at once, and the newsroom now has
 * a `kind` field on the post for the second one. A tag is a subject again.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'updatedAt'],
    description: 'Subjects. A newsroom post’s topics become the filter tabs on /newsroom.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}
