'use client'

import React, { useMemo, useState } from 'react'

import CaseStudyGrid, { type CaseStudyGridPost } from '@/components/CaseStudyGrid'

/** Every populated tag name on a post — posts can sit under several filters. */
function tagNames(post: CaseStudyGridPost): string[] {
  const names: string[] = []
  for (const tag of post.tags ?? []) {
    if (typeof tag !== 'string' && tag.name) names.push(tag.name)
  }
  return names
}

/**
 * Case-study index with a category filter bar — "All" plus a pill per tag,
 * filtering client-side so the page stays static.
 */
export default function WorkIndex({ posts }: { posts: CaseStudyGridPost[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const names = new Set<string>()
    for (const post of posts) for (const name of tagNames(post)) names.add(name)
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [posts])

  const filtered = activeTag ? posts.filter((post) => tagNames(post).includes(activeTag)) : posts

  return (
    <>
      {allTags.length > 0 && (
        <div className="gallery-filter work-filter">
          <button
            type="button"
            className={`tag ${activeTag === null ? 'tag-active' : ''}`}
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
          >
            All
          </button>
          {allTags.map((name) => (
            <button
              key={name}
              type="button"
              className={`tag ${activeTag === name ? 'tag-active' : ''}`}
              onClick={() => setActiveTag(name)}
              aria-pressed={activeTag === name}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        // remount on filter change so the cards replay their reveal
        <CaseStudyGrid key={activeTag ?? 'all'} posts={filtered} />
      ) : (
        <div className="empty-state">
          <p>No case studies under this tag yet.</p>
        </div>
      )}
    </>
  )
}
