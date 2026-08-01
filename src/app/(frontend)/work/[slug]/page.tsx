import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'

import config from '@/payload.config'
import ArticleBody from '@/components/ArticleBody'
import CaseStudyGrid from '@/components/CaseStudyGrid'
import CommentsSection from '@/components/CommentsSection'

// statically rendered per slug, refreshed in the background at most once a minute
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// cache() dedupes the generateMetadata + page queries into one DB hit
const getPost = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug }, _status: { not_equals: 'draft' } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt || post.roles || post.title }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const payload = await getPayload({ config: await config })
  const { docs: more } = await payload.find({
    collection: 'case-studies',
    where: { slug: { not_equals: slug }, _status: { not_equals: 'draft' } },
    limit: 2,
    sort: '-publishedAt',
    depth: 1,
    select: { title: true, slug: true, roles: true, year: true, mainMedia: true, tags: true },
  })

  return (
    <>
      <ArticleBody post={post} />

      <CommentsSection postId={post.id} postType="case-studies" />

      {more.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <h2>More work</h2>
            <Link href="/work">All work</Link>
          </div>
          <CaseStudyGrid posts={more} />
        </section>
      )}
    </>
  )
}
