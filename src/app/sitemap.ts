import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { siteConfig } from '@/site.config'

// Rebuilt on the same cadence as the pages it lists.
export const revalidate = 60

type Entry = MetadataRoute.Sitemap[number]

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Entry['changeFrequency'] }[] =
  [
    { path: '', priority: 1, changeFrequency: 'monthly' },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/work', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/gallery', priority: 0.5, changeFrequency: 'monthly' },
  ]

/**
 * Only published documents are listed — the `read` access control on both
 * collections already filters drafts for unauthenticated callers, and this runs
 * without a user, but the explicit `where` keeps that from being load-bearing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }),
  )

  try {
    const payload = await getPayload({ config: await config })

    const [caseStudies, posts] = await Promise.all([
      payload.find({
        collection: 'case-studies',
        where: { _status: { not_equals: 'draft' } },
        limit: 1000,
        depth: 0,
        pagination: false,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'blog',
        where: { _status: { not_equals: 'draft' } },
        limit: 1000,
        depth: 0,
        pagination: false,
        select: { slug: true, updatedAt: true },
      }),
    ])

    for (const [section, res] of [
      ['work', caseStudies],
      ['blog', posts],
    ] as const) {
      for (const doc of res.docs) {
        if (!doc.slug) continue
        entries.push({
          url: `${base}/${section}/${doc.slug}`,
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // A sitemap listing only the static routes beats the whole file 500ing
    // because the database happened to be unreachable at build time.
  }

  return entries
}
