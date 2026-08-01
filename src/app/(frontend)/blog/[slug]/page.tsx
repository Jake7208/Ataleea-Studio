import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import config from '@/payload.config'
import { siteConfig } from '@/site.config'
import CommentsSection from '@/components/CommentsSection'
import JournalList from '@/components/JournalList'
import Media from '@/components/Media'
import RichTextBody from '@/components/RichTextBody'
import { mediaInfo } from '@/lib/media'

// statically rendered per slug, refreshed in the background at most once a minute
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// cache() dedupes the generateMetadata + page queries into one DB hit
const getPost = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'blog',
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
  return { title: post.title, description: post.excerpt || post.title }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const payload = await getPayload({ config: await config })
  const { docs: more } = await payload.find({
    collection: 'blog',
    where: { slug: { not_equals: slug }, _status: { not_equals: 'draft' } },
    limit: 2,
    sort: '-publishedAt',
    depth: 1,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
      mainMedia: true,
    },
  })

  const hero = mediaInfo(post.mainMedia)
  const tags = (post.tags ?? []).filter(
    (t): t is Exclude<typeof t, string> => typeof t !== 'string',
  )
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article>
      <header className="post-hero container">
        <p className="eyebrow">Blog</p>
        <h1>{post.title}</h1>
        <div className="post-byline">
          <span>Written by {post.author || siteConfig.author}</span>
          {published && <span> · {published}</span>}
          {tags.length > 0 && <span> · {tags.map((t) => t.name).join(', ')}</span>}
        </div>
      </header>

      {hero && (
        <div className="container">
          <Media
            src={hero.url}
            srcSet={hero.srcSet}
            sizes="100vw"
            alt={hero.alt || post.title}
            mimeType={hero.mime}
            width={hero.width}
            height={hero.height}
          />
        </div>
      )}

      {post.body && (
        <div className="post-body container">
          <RichTextBody data={post.body as SerializedEditorState} />
        </div>
      )}

      <CommentsSection postId={post.id} postType="blog" />

      {more.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <h2>Keep reading</h2>
            <Link href="/blog">All posts</Link>
          </div>
          <JournalList posts={more} />
        </section>
      )}
    </article>
  )
}
