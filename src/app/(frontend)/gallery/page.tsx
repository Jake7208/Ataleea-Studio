import type { Metadata } from 'next'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import GalleryGrid, { type GalleryItem } from '@/components/GalleryGrid'
import { mediaInfo, ratioFor } from '@/lib/media'

// reading searchParams (?tag=) already makes this page render per-request

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'GALLERY_PAGE_DESCRIPTION',
}

type Props = { searchParams: Promise<{ tag?: string }> }

export default async function GalleryPage({ searchParams }: Props) {
  const { tag: activeTag } = await searchParams
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'media',
    limit: 200,
    sort: '-createdAt',
    depth: 1,
    select: {
      alt: true,
      description: true,
      dateTaken: true,
      url: true,
      mimeType: true,
      width: true,
      height: true,
      sizes: true,
      tags: true,
      // url/sizes URLs are generated at read time from these — they must be selected too
      filename: true,
      prefix: true,
    },
  })

  // Only tagged images belong to the gallery — untagged uploads are just post assets.
  const tagged = docs
    .map((doc) => ({
      doc,
      info: mediaInfo(doc),
      tags: (doc.tags ?? []).filter((t): t is Exclude<typeof t, string> => typeof t !== 'string'),
    }))
    .filter(
      (item) =>
        item.tags.length > 0 &&
        item.info !== null &&
        Boolean(item.info.mime?.startsWith('image/') || item.info.mime?.startsWith('video/')),
    )

  const tagNames = [...new Set(tagged.flatMap((item) => item.tags.map((t) => t.name)))].sort()

  const shown = activeTag
    ? tagged.filter((item) => item.tags.some((t) => t.name === activeTag))
    : tagged

  const items: GalleryItem[] = shown.map(({ doc, info, tags }) => ({
    id: doc.id,
    url: info!.url,
    srcSet: info!.srcSet,
    thumbUrl: doc.sizes?.thumbnail?.url || info!.url,
    alt: info!.alt,
    description: doc.description ?? null,
    dateTaken: doc.dateTaken ?? null,
    tags: tags.map((t) => t.name),
    mime: info!.mime,
    ratio: ratioFor(info),
    width: info!.width,
    height: info!.height,
  }))

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Gallery / {tagged.length}</p>
        <h1>GALLERY_PAGE_HEADLINE</h1>
        {tagNames.length > 0 && (
          <nav className="gallery-filter">
            <Link href="/gallery" className={`tag ${!activeTag ? 'tag-active' : ''}`}>
              All
            </Link>
            {tagNames.map((name) => (
              <Link
                key={name}
                href={`/gallery?tag=${encodeURIComponent(name)}`}
                className={`tag ${activeTag === name ? 'tag-active' : ''}`}
              >
                {name}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section className="container">
        {items.length > 0 ? (
          <GalleryGrid items={items} />
        ) : (
          <div className="empty-state">
            <p>
              {activeTag
                ? `Nothing tagged “${activeTag}” yet.`
                : 'Nothing here yet — tag an image in the admin panel to add it to the gallery.'}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
