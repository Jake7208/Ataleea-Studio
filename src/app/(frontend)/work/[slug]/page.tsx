import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import config from '@/payload.config'
import ArticleBody from '@/components/ArticleBody'
import NextProject from '@/components/NextProject'
import PreviewBanner from '@/components/PreviewBanner'

// statically rendered per slug, refreshed in the background at most once a minute
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// cache() dedupes the generateMetadata + page queries into one DB hit.
// `draft` comes from Next's draft mode, which only /next/preview can switch on
// and only for a signed-in admin — so an ordinary visitor always takes the
// published branch here.
const getPost = cache(async (slug: string, draft: boolean) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: draft
      ? { slug: { equals: slug } }
      : { slug: { equals: slug }, _status: { not_equals: 'draft' } },
    // returns the newest autosaved version rather than the last published one
    draft,
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const post = await getPost(slug, isEnabled)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || post.roles || post.title,
    // a draft is not for the index even if someone shares the preview link
    ...(isEnabled ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = await getPost(slug, isDraft)
  if (!post) notFound()

  const payload = await getPayload({ config: await config })
  // Two: the one that reads as "next", and one more so the section is a choice
  // rather than a single dead end.
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
      {isDraft && <PreviewBanner path={`/work/${slug}`} />}

      <ArticleBody post={post} />

      {more.length > 0 && <NextProject next={more[0]} />}
    </>
  )
}
