import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Has to live here rather than in not-found.tsx: that file isn't a route
// segment, so Next ignores a `metadata` export on it and the layout's
// index/follow would carry through to every bad URL on the site.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * Catch-all that exists only to hand unmatched URLs to this group's
 * not-found.tsx.
 *
 * Without it they belong to no route group, so Next has no root layout to
 * render them in and falls back to its own bare 404 — no header, no footer,
 * none of the site's type. Real routes (and /admin, /api in the payload group)
 * are more specific and still win.
 */
export default function NotFoundCatchAll(): never {
  notFound()
}
