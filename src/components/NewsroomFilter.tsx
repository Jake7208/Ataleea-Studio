'use client'

import React, { useMemo, useState } from 'react'

import FilterMenu, { type MenuOption } from '@/components/FilterMenu'
import NewsCard, { type NewsCardPost } from '@/components/NewsCard'
import { Funnel, SortArrows } from '@/components/icons'
import { topicsOf } from '@/lib/news'
import { reveal } from '@/lib/reveal'

const ALL = 'all'

/** Cards revealed at a time. Four rows of the three-up grid. */
const PAGE = 12

const SORTS = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  title: 'A to Z',
} as const

type Sort = keyof typeof SORTS

const when = (post: NewsCardPost) => (post.publishedAt ? Date.parse(post.publishedAt) : 0)

/**
 * `sort` runs on a copy of a server-ordered array and Array#sort is stable, so
 * posts sharing a timestamp keep the order the database gave them rather than
 * shuffling between renders.
 */
const COMPARE: Record<Sort, (a: NewsCardPost, b: NewsCardPost) => number> = {
  newest: (a, b) => when(b) - when(a),
  oldest: (a, b) => when(a) - when(b),
  title: (a, b) => a.title.localeCompare(b.title),
}

type Props = {
  /** Every published post, newest first — including the featured one. */
  posts: NewsCardPost[]
  /**
   * The post in the hero above. It is left out of the feed on All topics, where
   * it is already the largest thing on the page and a second copy reads as a
   * bug, and put back the moment a topic is chosen — otherwise a topic only the
   * featured post carries is a filter that can only ever come back empty.
   */
  featuredId?: string
}

/**
 * The newsroom's controls and the feed they order.
 *
 * These were links to `/newsroom?category=…`, so every click was a navigation,
 * and a navigation resets scroll — choosing a topic threw the reader back above
 * the control they had just used. There was nothing to fetch either: the page
 * already holds every post the filter can show.
 *
 * So the controls are state, not a route. Two things follow from that:
 *
 *   - No `?category=` in the URL, so a filtered view is not linkable. Putting it
 *     back means a router call, and `router.replace` re-fetches the route's
 *     payload even with `scroll: false` — the jump would go, the round trip
 *     would not.
 *   - "Load more" reveals rather than fetches. Every post is already here; the
 *     button is a disclosure control, not a pager.
 *
 * Only the cards on screen are rendered. Mounting the other eighty-eight to keep
 * them hidden cost about 2KB of HTML each and bought nothing — it was a
 * workaround for ScrollReveal enrolling elements once per route, which is fixed
 * where it belongs now.
 *
 * Where this stops working: the whole feed travels in the page payload, whether
 * or not it is rendered. The query asks for card fields only, no post bodies,
 * which puts a post at roughly a kilobyte of JSON — so a couple of hundred is
 * comfortable and a thousand is not. Past that the filter has to move back to
 * the server and become a URL parameter again, and the scroll jump returns with
 * it unless the feed alone is swapped under a header that holds still.
 */
export default function NewsroomFilter({ posts, featuredId }: Props) {
  const [topic, setTopic] = useState(ALL)
  const [sort, setSort] = useState<Sort>('newest')
  const [limit, setLimit] = useState(PAGE)

  const matches = useMemo(
    () => (name: string) =>
      posts.filter((post) =>
        name === ALL ? post.id !== featuredId : topicsOf(post).some((t) => t.name === name),
      ),
    [posts, featuredId],
  )

  /**
   * Topic options carry the number of posts choosing them would show. A count is
   * what stops the menu offering a dead end — and it is why the list is built
   * from the posts on the page rather than from the tags collection, which is
   * shared with case studies and the media library and would put subjects in
   * here that no article has ever carried.
   */
  const topicOptions = useMemo<MenuOption[]>(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const { name } of topicsOf(post)) counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return [
      { value: ALL, label: 'All topics', count: matches(ALL).length },
      ...[...counts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ value: name, label: name, count })),
    ]
  }, [posts, matches])

  const sortOptions = useMemo<MenuOption[]>(
    () => Object.entries(SORTS).map(([value, label]) => ({ value, label })),
    [],
  )

  const ordered = useMemo(
    () => [...matches(topic)].sort(COMPARE[sort]),
    [matches, topic, sort],
  )

  const shown = ordered.slice(0, limit)
  const remaining = ordered.length - shown.length

  return (
    <>
      <section className="newsroom-topics container">
        <div className="topics-header-row" {...reveal}>
          <div className="topics-eyebrow">Topics</div>
          <h2 className="topics-title">News by topic</h2>

          <div className="filter-bar">
            <FilterMenu
              icon={<Funnel />}
              label="Filter by topic"
              options={topicOptions}
              value={topic}
              // A new topic is a new set of posts, so how many are on screen
              // starts over. Reset here rather than in an effect watching
              // `topic` — the effect would render twice for one click.
              //
              // Changing the sort deliberately does not reset: it is the same
              // set in another order, and dropping the reader back to twelve
              // would take away something they had asked for.
              onChange={(value) => {
                setTopic(value)
                setLimit(PAGE)
              }}
            />
            <FilterMenu
              icon={<SortArrows />}
              label="Sort"
              options={sortOptions}
              value={sort}
              onChange={(value) => setSort(value as Sort)}
            />

            {/* Polite, so choosing a topic is confirmed without interrupting
                whatever the reader is on. */}
            <p className="filter-bar-count" role="status">
              {ordered.length === 0
                ? 'No articles'
                : `Showing ${shown.length} of ${ordered.length}`}
            </p>
          </div>
        </div>
      </section>

      <section className="container section-bottom">
        <div className="newsroom-grid reveal-group">
          {shown.map((post) => (
            <NewsCard key={post.id} post={post} sizes="(max-width: 768px) 100vw, 33vw" />
          ))}
        </div>

        {remaining > 0 && (
          <div className="newsroom-more">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setLimit((current) => current + PAGE)}
            >
              Load more
              <span className="newsroom-more-count">{remaining} left</span>
            </button>
          </div>
        )}

        {ordered.length === 0 && (
          <div className="empty-state">
            <p>Nothing filed under {topic} yet.</p>
          </div>
        )}
      </section>
    </>
  )
}
