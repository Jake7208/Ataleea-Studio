import type { GlobalConfig } from 'payload'

import { revalidateGlobalFor } from '../lib/revalidate'

/**
 * The artwork that belongs to a page rather than to a document.
 *
 * Case studies and journal posts carry their own cover image, but the home
 * page's three big shots have nowhere to live — they're part of the layout, not
 * of any one piece of work. They sat as hard-coded <ImageSlot> briefs until
 * this global gave them somewhere to be uploaded. A slot left empty keeps
 * rendering its brief, so the page never breaks and it stays obvious in review
 * which shots are still outstanding.
 */
export const SiteMedia: GlobalConfig = {
  slug: 'site-media',
  label: 'Site Media',
  admin: {
    group: 'Site',
    description:
      'The fixed images built into the page layouts. Each field says what the shot needs to be — leave one blank and the brief shows in its place on the site.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: revalidateGlobalFor({ paths: ['/'] }),
  fields: [
    {
      name: 'home',
      type: 'group',
      label: 'Home page',
      fields: [
        {
          name: 'hero',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero — establishing shot',
          admin: {
            description:
              'One finished project, wide. Building in full, shot straight on in good light. Sits full-bleed under the headline, so keep the subject off the extreme edges.',
          },
        },
        {
          name: 'statement',
          type: 'upload',
          relationTo: 'media',
          label: 'Approach — detail',
          admin: {
            description:
              'Close crop on craft: a material joint, a hand at work, a finished edge. Tall — it fills a portrait column beside the “most construction websites…” copy.',
          },
        },
        {
          name: 'band',
          type: 'upload',
          relationTo: 'media',
          label: 'Band — atmosphere',
          admin: {
            description:
              'Edge-to-edge site or interior shot. Wide, quiet, no text overlay. A visual pause between the work grid and the testimonials.',
          },
        },
      ],
    },
  ],
}
