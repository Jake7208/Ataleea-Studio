import type { ContactTopic } from '@/lib/contact-topics'

/**
 * The one list of services. Read by the home page teaser (title + summary only)
 * and by /services (the whole thing), so the two can't drift apart.
 *
 * `slug` is the anchor on /services — the footer and the home teaser link
 * straight to a service, so don't rename one without the other.
 */
export type Service = {
  number: string
  slug: string
  title: string
  summary: string
  detail: string[]
  deliverables: string[]
  /** pre-selects the matching radio when a CTA hands off to the contact panel */
  topic: ContactTopic
}

export const services: Service[] = [
  {
    number: '01',
    slug: 'project-sites',
    title: 'Project sites',
    topic: 'project',
    summary:
      'Websites built around the work itself: finished projects, process, results. No storefronts, no template padding.',
    detail: [
      'I start with the work. Before any layout exists I go through what you have done, pick the pieces worth leading with, and decide what each one needs to prove to the person looking at it.',
      'The result is a site that behaves like a portfolio rather than a brochure: large images, restrained typography, and enough structure that the quality of the work is obvious to whoever lands on it.',
      'Every site is drawn from scratch. That takes longer than assembling a theme, and it is the whole reason the finished thing does not look like the other twelve in your field.',
    ],
    deliverables: [
      'Full design & build',
      'Project galleries',
      'Case study pages',
      'Enquiry forms',
      'Photography direction',
      'Copywriting support',
      'Built on a CMS you can edit',
    ],
  },
  {
    number: '02',
    slug: 'local-search',
    title: 'Local search',
    topic: 'local',
    summary:
      'For businesses that serve a local area. Google Business Profile set up properly and kept current, so the people searching nearby find you first.',
    detail: [
      'This one is for businesses that serve a local area. If that is you, it is often worth more than the website itself. Most local businesses lose work to competitors with worse portfolios and better profiles. The profile is the storefront. Categories, service areas, photos and reviews decide whether you appear in the map results at all.',
      'I set it up correctly once, then keep it fed. New project photos, service area accuracy, and a review workflow you can actually keep up with.',
      'This is the part most studios hand back to you in a PDF. I would rather just do it, because a profile nobody maintains is worth about as much as one nobody set up.',
    ],
    deliverables: [
      'Profile setup & verification',
      'Categories & service areas',
      'Photo strategy',
      'Review workflow',
    ],
  },
  {
    number: '03',
    slug: 'content-care',
    title: 'Content & care',
    topic: 'care',
    summary:
      'Hosting, updates and a steady trickle of new work published each month. The site stays fast, current and worth visiting.',
    detail: [
      'A site that never changes stops earning its keep. The difference between a portfolio that generates enquiries and one that sits there is whether anything new appears on it.',
      'I handle the hosting and the framework updates, and publish new projects as you finish them, so the site is always showing your most recent work rather than whatever was ready on launch day.',
      'The care plans below are how this is priced. They are month to month, so if a quiet quarter means you want to pause, you pause.',
    ],
    deliverables: [
      'Managed hosting',
      'Your finished jobs published monthly',
      'Content updates',
      'Performance reporting',
    ],
  },
]
