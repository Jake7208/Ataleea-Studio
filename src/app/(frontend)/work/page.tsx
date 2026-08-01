import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import WorkIndex from '@/components/WorkIndex'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Work',
  description: 'WORK_PAGE_DESCRIPTION',
}

export default async function WorkPage() {
  const payload = await getPayload({ config: await config })

  const { docs: posts, totalDocs } = await payload.find({
    collection: 'case-studies',
    where: { _status: { not_equals: 'draft' } },
    limit: 30,
    sort: '-publishedAt',
    depth: 1,
    // grid view never needs the article body — skip the heaviest field
    select: { title: true, slug: true, roles: true, year: true, mainMedia: true, tags: true },
  })

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Work / {totalDocs}</p>
        <h1>WORK_PAGE_HEADLINE</h1>
      </section>

      <section className="container">
        {posts.length > 0 ? (
          <WorkIndex posts={posts} />
        ) : (
          <div className="empty-state">
            <p>Case studies are being written — check back soon.</p>
          </div>
        )}
      </section>
    </>
  )
}
