import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import config from '@/payload.config'
import { siteConfig } from '@/site.config'
import CopyLink from '@/components/CopyLink'
import Media from '@/components/Media'
import NewsCard from '@/components/NewsCard'
import PreviewBanner from '@/components/PreviewBanner'
import RichTextBody from '@/components/RichTextBody'
import { ArrowRight } from '@/components/icons'
import { mediaInfo } from '@/lib/media'
import { formatDate, kindLabel, readingMinutes, topicsOf } from '@/lib/news'
import { reveal } from '@/lib/reveal'

// statically rendered per slug, refreshed in the background at most once a minute
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// cache() dedupes the generateMetadata + page queries into one DB hit.
// See the note in work/[slug] — `draft` can only be on for a signed-in admin
// who came through /next/preview.
const getPost = cache(async (slug: string, draft: boolean) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'blog',
    where: draft
      ? { slug: { equals: slug } }
      : { slug: { equals: slug }, _status: { not_equals: 'draft' } },
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
    description: post.excerpt || post.title,
    ...(isEnabled ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = await getPost(slug, isDraft)
  if (!post) notFound()

  const payload = await getPayload({ config: await config })
  const { docs: more } = await payload.find({
    collection: 'blog',
    where: { slug: { not_equals: slug }, _status: { not_equals: 'draft' } },
    // three across, matching the newsroom grid the section links out to
    limit: 3,
    sort: '-publishedAt',
    depth: 1,
  })

  const hero = mediaInfo(post.mainMedia)
  const topics = topicsOf(post)
  const published = formatDate(post.publishedAt)
  const minutes = readingMinutes(post.body)

  return (
    <article>
      {isDraft && <PreviewBanner path={`/newsroom/${slug}`} />}

      {/* Danelec's order, which is the one that answers a reader's questions in
          the order they ask them: what kind of thing is this, when is it from,
          how long is it — then the headline, then who wrote it and what it is
          about, then the picture. The eyebrow used to read "Newsroom", which
          said only where the reader already was.
          The excerpt is deliberately not here. It sits under the hero, as the
          opening paragraph of the article — see below. */}
      <header className="post-hero container">
        <div className="post-kicker">
          <span className="post-kind">{kindLabel(post.kind)}</span>
          {published && <span>{published}</span>}
          {minutes && <span>{minutes} min read</span>}
        </div>

        <h1>{post.title}</h1>

        <div className="post-byline">
          <span>Written by {post.author || siteConfig.author}</span>
          {topics.length > 0 && (
            <ul className="post-topics">
              {topics.map((topic) => (
                <li key={topic.id}>{topic.name}</li>
              ))}
            </ul>
          )}
          {/* Built from siteConfig rather than window.location, so what gets
              shared is the canonical address without whatever query string the
              reader happened to arrive on. */}
          <CopyLink url={`${siteConfig.url}/newsroom/${slug}`} />
        </div>
      </header>

      {hero && (
        <div className="post-media-container">
          <Media
            src={hero.url}
            srcSet={hero.srcSet}
            sizes="(max-width: 960px) 100vw, 960px"
            alt={hero.alt || post.title}
            mimeType={hero.mime}
            width={hero.width}
            height={hero.height}
          />
        </div>
      )}

      {/* The excerpt opens the article rather than sitting above the picture,
          which is where Danelec puts theirs and what makes it read as the first
          paragraph instead of a caption for the headline. It lives in the body
          block so it takes the body's column and lines up with the prose under
          it — set above the hero it belonged to the header and lined up with
          nothing. */}
      {(post.excerpt || post.body) && (
        <div className="post-body">
          {post.excerpt && (
            <div className="post-lede">
              <p className="post-standfirst">{post.excerpt}</p>
            </div>
          )}
          {post.body && <RichTextBody data={post.body as SerializedEditorState} />}
        </div>
      )}

      {more.length > 0 && (
        <section className="section container post-related">
          <div className="section-head" {...reveal}>
            <div>
              <h2>Explore related</h2>
            </div>

            <Link href="/newsroom" className="link-arrow">
              All news
              <ArrowRight />
            </Link>
          </div>

          <div className="newsroom-grid reveal-group">
            {more.map((post) => (
              <NewsCard key={post.id} post={post} sizes="(max-width: 600px) 100vw, 33vw" />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
