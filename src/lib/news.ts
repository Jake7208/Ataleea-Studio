import type { Blog, Tag } from '@/payload-types'

/**
 * What a post *is* — the label on its card chip and above its headline.
 *
 * This used to be inferred from the tag list: a tag typed `category` named the
 * chip, and a post without one fell back to the literal word "News". That is
 * how the newsroom ended up with tags called "Article" and "Articles", where
 * the singular one printed NEWS and the plural one printed ARTICLES. Which of
 * them a post happened to carry decided what the card called it.
 *
 * A post's kind is a property of the post, so it lives on the post. Tags are
 * back to being topics, which is all the other collections ever used them for.
 */
export const KINDS = {
  article: 'Article',
  news: 'News',
  'press-release': 'Press release',
} as const

export type Kind = keyof typeof KINDS

/** Falls back to Article, which is what a post with no kind set was in practice. */
export const kindLabel = (kind?: string | null): string => KINDS[kind as Kind] ?? KINDS.article

/** A tag, once it is known to be populated rather than a bare id. */
export type Topic = Pick<Tag, 'id' | 'name'>

/** Drops the ids Payload leaves unpopulated at depth 0 so callers get names. */
export const topicsOf = (post: Pick<Blog, 'tags'>): Topic[] =>
  (post.tags ?? []).filter((t): t is Tag => typeof t !== 'string')

/**
 * Reading time in whole minutes, or null for a post short enough that claiming
 * one would be noise.
 *
 * 220wpm is the middle of the range measured for adults reading prose on a
 * screen. The number is a courtesy, not a measurement — it exists because
 * Danelec's articles carry one and the row looks thin without it.
 */
export function readingMinutes(body: unknown): number | null {
  const words = countWords(body)
  if (words < 120) return null
  return Math.max(1, Math.round(words / 220))
}

/** Walks a Lexical tree adding up the text nodes. Shape-agnostic on purpose. */
function countWords(node: unknown): number {
  if (!node || typeof node !== 'object') return 0

  const n = node as { text?: unknown; root?: unknown; children?: unknown }

  if (typeof n.text === 'string') {
    return n.text.trim() ? n.text.trim().split(/\s+/).length : 0
  }

  let total = 0
  if (n.root) total += countWords(n.root)
  if (Array.isArray(n.children)) {
    for (const child of n.children) total += countWords(child)
  }
  return total
}

/** The one date format the newsroom uses, so cards and articles agree. */
export const formatDate = (value?: string | null, month: 'short' | 'long' = 'long'): string | null =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' })
    : null
