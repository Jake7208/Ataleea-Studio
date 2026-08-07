import type { Metadata } from 'next'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import Media from '@/components/Media'
import NewsroomFilter from '@/components/NewsroomFilter'
import { mediaInfo } from '@/lib/media'
import { formatDate, kindLabel } from '@/lib/news'
import { reveal } from '@/lib/reveal'

// statically rendered, refreshed in the background at most once a minute.
// The topic filter is client state now, so there is no search param to read and
// nothing to force this route dynamic — see NewsroomFilter.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Newsroom',
  description: 'Latest updates on design, development, and studio news.',
}

export default async function NewsroomIndexPage() {
  const payload = await getPayload({ config: await config })

  const { docs: posts } = await payload.find({
    collection: 'blog',
    where: { _status: { equals: 'published' } },
    // The whole feed travels to the browser, because the filter and the sort
    // run there — so this asks for the fields a card draws and nothing else.
    // Without `select` every post arrives with its full Lexical body attached,
    // which is the difference between a card costing half a kilobyte and
    // costing twenty. See the ceiling note in NewsroomFilter.
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      kind: true,
      tags: true,
      excerpt: true,
      mainMedia: true,
    },
    limit: 200,
    sort: '-publishedAt',
    depth: 1,
  })

  const featuredPost = posts[0]
  const featuredMedia = featuredPost ? mediaInfo(featuredPost.mainMedia) : null
  const featuredDate = formatDate(featuredPost?.publishedAt)

  return (
    <>
      {/* The one post at the top of the page, on the tinted ground so the feed
          below reads as a separate register rather than as more of the same. */}
      {featuredPost && (
        <section className="newsroom-hero section-alt">
          <div className="container">
            <div className="newsroom-featured" {...reveal}>
              <div className="featured-content">
                <div className="featured-meta">
                  <span className="featured-tag">Featured</span>
                  <span className="featured-kind">{kindLabel(featuredPost.kind)}</span>
                  {featuredDate && <span className="featured-date">{featuredDate}</span>}
                </div>
                <h1 className="featured-title">{featuredPost.title}</h1>
                {featuredPost.excerpt && <p className="featured-excerpt">{featuredPost.excerpt}</p>}
                <Link href={`/newsroom/${featuredPost.slug}`} className="btn btn-solid featured-btn">
                  Read {kindLabel(featuredPost.kind).toLowerCase()}
                </Link>
              </div>

              {featuredMedia && (
                <Link href={`/newsroom/${featuredPost.slug}`} className="featured-media-wrapper">
                  <Media
                    src={featuredMedia.url}
                    srcSet={featuredMedia.srcSet}
                    sizes="(max-width: 900px) 100vw, 50vw"
                    alt={featuredMedia.alt || featuredPost.title}
                    mimeType={featuredMedia.mime}
                    width={featuredMedia.width}
                    height={featuredMedia.height}
                  />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <NewsroomFilter posts={posts} featuredId={featuredPost?.id} />
    </>
  )
}
