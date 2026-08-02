import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import JournalList from '@/components/JournalList'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes on design, local search and running a service business online.',
}

export default async function BlogIndexPage() {
  const payload = await getPayload({ config: await config })

  const { docs: posts, totalDocs } = await payload.find({
    collection: 'blog',
    where: { _status: { not_equals: 'draft' } },
    limit: 40,
    sort: '-publishedAt',
    depth: 1,
    // list view never needs the rich-text body — skip the heaviest field
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
      mainMedia: true,
    },
  })

  return (
    <>
      <section className="page-intro container">
        <div data-reveal>
          <p className="eyebrow">Journal / {totalDocs}</p>
          <h1>Notes from the studio.</h1>
        </div>
      </section>

      <section className="container">
        {posts.length > 0 ? (
          <JournalList posts={posts} />
        ) : (
          <div className="empty-state">
            <p>Nothing published yet — the first post is coming.</p>
          </div>
        )}
      </section>
    </>
  )
}
