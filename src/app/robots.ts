import type { MetadataRoute } from 'next'

import { siteConfig } from '@/site.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /api holds endpoints that shouldn't be crawled at all.
      //
      // The admin panel is deliberately absent. robots.txt is world-readable, so
      // naming the path here would publish the one thing moving it off /admin
      // was meant to keep quiet — and it would be the first file an attacker
      // reads. The panel's own pages carry `robots: noindex, nofollow` from
      // admin.meta in payload.config.ts, which keeps it out of the index without
      // announcing it.
      disallow: ['/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
