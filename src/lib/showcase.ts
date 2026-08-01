import type { Blog, CaseStudy } from '@/payload-types'

import { mediaInfo, type MediaInfo } from '@/lib/media'

/** A case study and a journal entry, flattened to the shape the hero card renders. */
export type Showcase = {
  href: string
  eyebrow: string
  title: string
  meta: string
  media: MediaInfo | null
  publishedAt?: string | null
}

/** Only the fields the hero card needs — lets the page query with `select`. */
export type ShowcaseCaseStudy = Pick<
  CaseStudy,
  'title' | 'slug' | 'roles' | 'year' | 'mainMedia' | 'publishedAt'
>
export type ShowcaseEntry = Pick<Blog, 'title' | 'slug' | 'mainMedia' | 'publishedAt'>

const publishedTime = (date?: string | null) => (date ? new Date(date).getTime() : 0)

const formatDate = (date?: string | null) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

/**
 * Picks whichever piece went out most recently for the hero card. Pass the head of
 * each list — both are already sorted newest-first. A tie goes to the case study,
 * the heavier piece of work.
 */
export function pickShowcase(
  caseStudy?: ShowcaseCaseStudy | null,
  entry?: ShowcaseEntry | null,
): Showcase | null {
  const showcases: Showcase[] = []

  if (caseStudy) {
    showcases.push({
      href: `/work/${caseStudy.slug}`,
      eyebrow: 'Latest case study',
      title: caseStudy.title,
      meta: [caseStudy.roles, caseStudy.year].filter(Boolean).join(' — '),
      media: mediaInfo(caseStudy.mainMedia),
      publishedAt: caseStudy.publishedAt,
    })
  }

  if (entry) {
    showcases.push({
      href: `/blog/${entry.slug}`,
      eyebrow: 'Latest journal entry',
      title: entry.title,
      // entries carry no roles or year, so the date stands in as the same "when" cue
      meta: formatDate(entry.publishedAt),
      media: mediaInfo(entry.mainMedia),
      publishedAt: entry.publishedAt,
    })
  }

  // stable sort, so the case study stays ahead of an entry published the same instant
  showcases.sort((a, b) => publishedTime(b.publishedAt) - publishedTime(a.publishedAt))
  return showcases[0] ?? null
}
