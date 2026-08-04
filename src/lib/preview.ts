import type { GeneratePreviewURL } from 'payload'

import { siteConfig } from '../site.config'

/**
 * Builds the "Preview" button URL for a drafted collection.
 *
 * It points at /next/preview rather than straight at the page: draft content is
 * invisible to a normal request, so something has to turn Next's draft mode on
 * first. That route does the auth check and then redirects here.
 *
 * Returns null for a document with no slug — an autosaved draft that has never
 * been given a title — which hides the button rather than offering a link to a
 * URL that cannot resolve.
 */
export const previewFor =
  (basePath: string): GeneratePreviewURL =>
  (doc) => {
    const slug = typeof doc?.slug === 'string' ? doc.slug : null
    if (!slug) return null

    const params = new URLSearchParams({ path: `${basePath}/${slug}` })
    return `${siteConfig.url}/next/preview?${params.toString()}`
  }
