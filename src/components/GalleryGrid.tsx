'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ArrowLeft, ArrowRight } from '@/components/icons'

export type GalleryItem = {
  id: string
  url: string
  srcSet: string | null
  /** small candidate for the lightbox filmstrip */
  thumbUrl: string
  alt: string
  description: string | null
  dateTaken: string | null
  tags: string[]
  mime: string | null
  ratio: '4-3' | '3-4' | '16-9' | '1-1'
  width: number | null
  height: number | null
}

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

/**
 * The gallery grid plus a lightbox: full image, description and shot info,
 * filmstrip of the rest below. Keyboard: Escape closes, arrows step.
 */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpenIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  )

  // scroll lock + keyboard while open
  useEffect(() => {
    if (openIndex === null) return

    document.documentElement.classList.add('lightbox-open')
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('lightbox-open')
      document.documentElement.style.overflow = ''
    }
  }, [openIndex !== null, close, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const active = openIndex === null ? null : items[openIndex]

  return (
    <>
      <div className="gallery-grid">
        {items.map((item, i) => (
          <div key={item.id} className="gallery-item">
            <button
              type="button"
              className="gallery-open"
              onClick={() => setOpenIndex(i)}
              aria-label={`View ${item.alt || 'image'}`}
            >
              {item.mime?.startsWith('video/') ? (
                <video src={item.url} muted playsInline preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
                <img
                  src={item.url}
                  srcSet={item.srcSet ?? undefined}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </button>
            {item.alt && <p className="gallery-caption">{item.alt}</p>}
          </div>
        ))}
      </div>

      {/* portaled to <body> so no ancestor stacking context can trap the overlay */}
      {active &&
        openIndex !== null &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.alt}>
            <header className="lightbox-top">
              <span className="lightbox-count">
                {pad(openIndex + 1)} / {pad(items.length)}
              </span>
              <button ref={closeRef} type="button" className="lightbox-close" onClick={close}>
                Close
              </button>
            </header>

            <div className="lightbox-main">
              <div
                className="lightbox-stage"
                onClick={(e) => {
                  // clicking the empty space around the image closes, like a backdrop
                  if (e.target === e.currentTarget) close()
                }}
              >
                {active.mime?.startsWith('video/') ? (
                  <video key={active.id} src={active.url} controls autoPlay playsInline loop />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
                  <img
                    key={active.id}
                    src={active.url}
                    srcSet={active.srcSet ?? undefined}
                    sizes="(max-width: 900px) 100vw, 70vw"
                    alt={active.alt}
                  />
                )}
              </div>

              <aside className="lightbox-info">
                {active.alt && <h2 className="lightbox-title">{active.alt}</h2>}
                {active.description && <p className="lightbox-desc">{active.description}</p>}
                <dl className="lightbox-meta">
                  {active.dateTaken && (
                    <div>
                      <dt>Date taken</dt>
                      <dd>{formatDate(active.dateTaken)}</dd>
                    </div>
                  )}
                  {active.tags.length > 0 && (
                    <div>
                      <dt>Tags</dt>
                      <dd>{active.tags.join(', ')}</dd>
                    </div>
                  )}
                  {active.width && active.height && (
                    <div>
                      <dt>Frame</dt>
                      <dd>
                        {active.width} &times; {active.height}
                      </dd>
                    </div>
                  )}
                </dl>
                {items.length > 1 && (
                  <div className="lightbox-navrow">
                    <button
                      type="button"
                      className="lightbox-nav"
                      onClick={() => step(-1)}
                      aria-label="Previous image"
                    >
                      <ArrowLeft />
                    </button>
                    <button
                      type="button"
                      className="lightbox-nav"
                      onClick={() => step(1)}
                      aria-label="Next image"
                    >
                      <ArrowRight />
                    </button>
                  </div>
                )}
              </aside>
            </div>

            {items.length > 1 && (
              <footer className="lightbox-thumbs">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`lightbox-thumb ${i === openIndex ? 'is-active' : ''}`}
                    onClick={() => setOpenIndex(i)}
                    aria-label={`View ${item.alt || `image ${i + 1}`}`}
                    aria-current={i === openIndex}
                  >
                    {item.mime?.startsWith('video/') ? (
                      <video src={item.thumbUrl} muted playsInline preload="metadata" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- tiny filmstrip thumbs
                      <img src={item.thumbUrl} alt="" loading="lazy" decoding="async" />
                    )}
                  </button>
                ))}
              </footer>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
