/**
 * One place for everything site-specific. Fill this out first when starting a
 * new site — the layout, header, footer, metadata and Payload defaults all
 * read from here.
 */
export const siteConfig = {
  /** Site / brand name — used in the <title> template and the header logo slot. */
  name: 'Ataleea Studio',

  /** Default meta description for the whole site. */
  description:
    'A design studio for people who build things — image-led websites and local search for contractors, trades and service companies.',

  /** The person (or studio) behind the site — used as the default post author. */
  author: 'Ataleea LLC',

  /** Public contact email shown in the footer. */
  email: 'hello@ataleea.com',

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
    { href: '/#services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Journal' },
  ],
} as const
