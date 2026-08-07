/**
 * One place for everything site-specific. Fill this out first when starting a
 * new site — the layout, header, footer, metadata and Payload defaults all
 * read from here.
 */
export const siteConfig = {
  /** Site / brand name — used in the <title> template and the header logo slot. */
  name: 'Ataleea Studio',

  /**
   * Canonical origin, no trailing slash. Everything that has to emit an absolute
   * URL reads this: metadataBase, the sitemap, robots.txt and the social cards.
   * Set NEXT_PUBLIC_SITE_URL in production — left unset, links in shared
   * previews and the sitemap will point at localhost.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),

  /** Default meta description for the whole site. */
  description:
    'Websites for people with work worth showing. Portfolios, practices and independent businesses, each one drawn from scratch rather than dropped into a template.',

  /** The person (or studio) behind the site — used as the default post author. */
  author: 'Ataleea LLC',

  /** Public contact email shown in the footer. */
  email: 'contact@ataleea.com',

  /** Shown in the footer's location column. */
  location: {
    line1: 'Ataleea LLC',
    line2: 'United States',
  },

  /** External profiles listed in the footer. */
  social: [
    { label: 'LinkedIn', href: 'https://linkedin.com/company/ataleea' },
    { label: 'Google Business Profile', href: '#' },
  ],

  /** Primary navigation — shared by the header and footer. */
  nav: [
    { href: '/work', label: 'Work' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/newsroom', label: 'Newsroom' },
  ],
} as const
