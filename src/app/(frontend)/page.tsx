import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import { ContactTrigger } from '@/components/ContactPanel'
import FaqSection from '@/components/FaqSection'
import ImageSlot from '@/components/ImageSlot'
import ServicesSection from '@/components/ServicesSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import WorkShowcaseSection from '@/components/WorkShowcaseSection'
import { ArrowRight } from '@/components/icons'
import HeroBanner from '@/components/HeroBanner'
import { kindLabel } from '@/lib/news'
import { reveal } from '@/lib/reveal'
import ScrollPathLine from '@/components/ScrollPathLine'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

// Positioning, not a service list — the services section below names what you
// can actually buy, and repeating those three titles here read as indecision.
const capabilities = [
  {
    number: '01',
    title: 'Drawn, not assembled',
    copy: 'No themes and no page builders. Each site starts as a blank page and your work.',
  },
  {
    number: '02',
    title: 'Built to be found',
    copy: 'Fast, structured and searchable, with local search set up alongside it when you serve an area.',
  },
  {
    number: '03',
    title: 'Still current in a year',
    copy: 'New work published as you finish it, rather than left at launch-day state.',
  },
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [featuredRes, testimonialRes, faqRes, siteMedia, blogRes] = await Promise.all([
    payload.find({
      collection: 'case-studies',
      where: { _status: { not_equals: 'draft' } },
      limit: 3,
      sort: '-publishedAt',
      depth: 1,
      // the grid only needs the cover and caption fields
      select: { title: true, slug: true, roles: true, year: true, mainMedia: true, tags: true },
    }),
    payload.find({
      collection: 'testimonials',
      where: { featured: { equals: true } },
      limit: 3,
      sort: '_order',
      depth: 1,
    }),
    payload.find({
      collection: 'faqs',
      where: { published: { equals: true } },
      limit: 12,
      sort: '_order',
      depth: 0,
      select: { question: true, answer: true },
    }),
    // the three fixed shots built into this page's layout — depth 1 so each
    // upload arrives populated rather than as a bare id
    payload.findGlobal({ slug: 'site-media', depth: 1 }),
    payload.find({
      collection: 'blog',
      where: { _status: { equals: 'published' } },
      limit: 5,
      sort: '-publishedAt',
      depth: 1,
    }),
  ])

  const home = siteMedia?.home
  const latestPosts = blogRes?.docs || []

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <h1 className="display hero-display" {...reveal}>
            Digital presence for work worth showing.
          </h1>

          <div className="hero-body" {...reveal}>
            <p className="lead">
              I design and build websites for people with work worth showing. Portfolios,
              practices, small businesses. Every one is drawn from scratch rather than dropped
              into a template.
            </p>

            <div className="hero-actions">
              <ContactTrigger className="btn btn-solid">Start a project</ContactTrigger>
              <Link href="/work" className="link-arrow">
                See the work
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* wider than the text column, inset just enough to keep off the edge */}
        <div className="container-wide">
          {/* "rise" rather than a plain reveal: this is the page's LCP element,
              and a fade from transparent is charged to that metric in full. See
              the note on [data-reveal='rise'] in styles.css. */}
          <div>
            <HeroBanner media={home?.hero} />
          </div>
        </div>

        <div className="container hero-index-wrap">
          <ScrollPathLine />
          <div className="hero-index reveal-group">
            {capabilities.map(({ number, title, copy }) => (
              <div key={number} className="hero-index-item scroll-triggered-card" {...reveal}>
                <span className="num">{number}</span>
                {/* h2, not h3: these are the first headings under the page's h1,
                    and jumping a level to get the smaller default size is what
                    an outline reader trips over. The size comes from
                    .hero-index-item's own rule regardless. */}
                <h2>{title}</h2>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT ─────────────────────────────────────────────────────── */}
      {/* Stays on paper. This was forest for a while, which gave the page two
          dark blocks with a light one between them and read as banding rather
          than as structure. Selected work below is the one dark chapter. */}
      <section className="section section-alt">
        <div className="container statement-layout">
          <div className="statement-text" {...reveal}>
            <h2 className="statement-title">
              Most portfolio sites are a template with a logo dropped in.
            </h2>

            <div className="statement-body">
              <p>
                A page builder can put a site online in a weekend. It will also look like every
                other site put online that weekend, and it will show your best project at the same
                size as your worst.
              </p>
              <p>
                If your work is the reason people hire you, you don&rsquo;t need a shopping cart.
                You need the work itself shown properly, at a size where the quality is obvious.
              </p>
              <p>So I design each site from scratch, around your work. One job, done properly.</p>
            </div>
          </div>

          <div className="statement-media bleed-right" {...reveal}>
            <ImageSlot
              label="Approach, detail"
              spec="Close crop on craft: a typographic detail, a grid at rest, one component enlarged. Tall."
              media={home?.statement}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <ServicesSection />

      {/* ── SELECTED WORK ─────────────────────────────────────────────────── */}
      <WorkShowcaseSection posts={featuredRes.docs} />

      {/* ── FULL-BLEED BAND ───────────────────────────────────────────────── */}
      {/* deliberately edge to edge, no container, and the band itself is
          deliberately not revealed. The band is a pause between two sections, so
          it should already be there when the scroll arrives at it. Animating it
          makes the pause an event, and any move on a section touching both
          screen edges also drags a strip of page colour out from under the
          tinted section above.

          The line on it is a different matter and does reveal: it is centred
          well inside the band, and the band clips its own overflow, so there is
          nothing for its 28px to drag out.

          This slot asked for "a slow abstract loop", so it is the generated
          field rather than a file — no loop to spot, and nothing to shoot. The
          seed puts it somewhere else in its own timeline than the hero, so the
          two read as the same material rather than the same picture.

          The statement is placed here rather than anywhere else on purpose: the
          claim is made in the statement section, the evidence for it is the work
          grid immediately above, and this is where it gets paid off — with the
          proof of it, in the testimonials, immediately below. No button on it.
          The footer carries the only call to action on the site. */}
      <section className="band">
        <HeroBanner variant="band" seed={137}>
          <div className="band-split-container">
            <div className="band-split-left" {...reveal}>
              <h2 className="band-statement-title">
                Bespoke digital design & code. <br />
                Formed around your work.
              </h2>
            </div>

            <div className="band-split-right">
              {latestPosts.length > 0 ? (
                <div className="band-news-container reveal-group">
                  <div className="band-news-header" {...reveal}>
                    <h2 className="band-news-title">Recent news</h2>
                    <Link href="/newsroom" className="band-news-all">
                      All news
                      <ArrowRight />
                    </Link>
                  </div>

                  <div className="band-news-list">
                    {latestPosts.map((post) => {
                      const date = post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : null
                      const media = post.mainMedia && typeof post.mainMedia !== 'string' ? post.mainMedia : null

                      return (
                        <Link
                          key={post.id}
                          href={`/newsroom/${post.slug}`}
                          className="band-news-row"
                          {...reveal}
                        >
                          {media?.url && (
                            <div className="band-news-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={media.url}
                                alt={media.alt || post.title}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="band-news-meta-content">
                            <div className="band-news-meta">
                              <span className="band-news-tag">{kindLabel(post.kind)}</span>
                              {date && <span className="band-news-date">{date}</span>}
                            </div>
                            <h3 className="band-news-row-title">{post.title}</h3>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="band-news-empty" {...reveal}>
                  Nothing published in the newsroom yet.
                </p>
              )}
            </div>
          </div>
        </HeroBanner>
      </section>

      {/* care plans moved to /services — pricing belongs with the services it
          prices, and the home page was carrying two service blocks */}

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <TestimonialsSection items={testimonialRes.docs} />

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      {/* the closing call to action lives in the footer, on every page */}
      <FaqSection items={faqRes.docs} />

    </>
  )
}
