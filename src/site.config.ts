/**
 * One place for everything site-specific. Fill this out first when starting a
 * new site — the layout, header, footer, metadata and Payload defaults all
 * read from here.
 */
export const siteConfig = {
  /** Site / brand name — used in the <title> template and the header logo slot. */
  name: 'SITE_NAME',

  /** Default meta description for the whole site. */
  description: 'SITE_DESCRIPTION',

  /** The person (or studio) behind the site — used as the default post author. */
  author: 'AUTHOR_NAME',

  /** Public contact email shown in the footer. */
  email: 'you@example.com',

  /** Shown in the footer's location column. */
  location: {
    line1: 'City, Region',
    line2: 'Time zone',
  },

  /** External profiles listed in the footer. */
  social: [
    { label: 'GitHub', href: 'https://github.com/USERNAME' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/USERNAME/' },
  ],

  /** Primary navigation — shared by the header and footer. */
  nav: [
    { href: '/', label: 'Home' },
    { href: '/work', label: 'Work' },
    { href: '/blog', label: 'Blog' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
