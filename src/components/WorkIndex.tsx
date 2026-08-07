'use client'

import React, { useMemo, useState } from 'react'

import CaseStudyGrid, { type CaseStudyGridPost } from '@/components/CaseStudyGrid'
import FilterMenu, { type MenuOption } from '@/components/FilterMenu'
import { Funnel } from '@/components/icons'

const ALL = 'all'

/** Every populated tag name on a post — posts can sit under several filters. */
function tagNames(post: CaseStudyGridPost): string[] {
  const names: string[] = []
  for (const tag of post.tags ?? []) {
    if (typeof tag !== 'string' && tag.name) names.push(tag.name)
  }
  return names
}

/**
 * Case-study index with a category filter, client-side so the page stays static.
 *
 * The control is the newsroom's <FilterMenu>, not the row of pills this used to
 * be. Two reasons, and the second is why it changed now:
 *
 *   - The pills grew with the tag list. That is the same wall-of-pills the
 *     newsroom moved off, and there is no reason for two grids on the same site
 *     to be filtered by two different controls.
 *   - .tag-active filled the chosen pill with --forest, which separates from the
 *     cream page but not from the near-black one. In dark mode the selection was
 *     invisible, border and all. The token is fixed where it lives, but this page
 *     is better served by the control the newsroom already uses.
 */
export default function WorkIndex({ posts }: { posts: CaseStudyGridPost[] }) {
  const [tag, setTag] = useState(ALL)

  /**
   * Built from the posts on the page rather than from the tags collection, which
   * is shared with the newsroom and the media library and would offer categories
   * no case study carries. The counts are what keep the menu from offering a
   * dead end.
   */
  const options = useMemo<MenuOption[]>(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const name of tagNames(post)) counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return [
      { value: ALL, label: 'All work', count: posts.length },
      ...[...counts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ value: name, label: name, count })),
    ]
  }, [posts])

  const filtered = tag === ALL ? posts : posts.filter((post) => tagNames(post).includes(tag))

  return (
    <>
      {/* nothing but "All work" means nothing is tagged, and a filter of one is
          a control that cannot do anything */}
      {options.length > 1 && (
        <div className="filter-bar work-filter">
          <FilterMenu
            icon={<Funnel />}
            label="Filter by category"
            options={options}
            value={tag}
            onChange={setTag}
          />

          {/* Polite, so choosing a category is confirmed without interrupting
              whatever the reader is on. */}
          <p className="filter-bar-count" role="status">
            {filtered.length === 0
              ? 'No projects'
              : `Showing ${filtered.length} of ${posts.length}`}
          </p>
        </div>
      )}

      {filtered.length > 0 ? (
        // remount on filter change so the cards replay their reveal
        <CaseStudyGrid key={tag} posts={filtered} />
      ) : (
        <div className="empty-state">
          <p>No case studies under this tag yet.</p>
        </div>
      )}
    </>
  )
}
