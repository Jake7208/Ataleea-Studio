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

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

// Positioning, not a service list — the services section below names what you
// can actually buy, and repeating those three titles here read as indecision.
const capabilities = [
  {
    number: '01',
    title: 'Drawn, not assembled',
    copy: 'No themes and no page builders. Each site starts as a blank page and your projects.',
  },
  {
    number: '02',
    title: 'Built to be found',
    copy: 'Site and Google profile set up together, so a search for your trade nearby lands on you.',
  },
  {
    number: '03',
    title: 'Still current in a year',
    copy: 'New work published as you finish it, rather than left at launch-day state.',
  },
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [featuredRes, testimonialRes, faqRes, siteMedia] = await Promise.all([
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
  ])

  const home = siteMedia?.home

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <h1 className="display hero-display" data-reveal>
            Digital presence for people who build things.
          </h1>

          <div className="hero-body" data-reveal>
            <p className="lead">
              I design and build websites for construction companies and the trades around them.
              Every one is drawn from scratch rather than dropped into a template, then set up to
              be found on local search.
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
          <div className="hero-media full-media" data-reveal>
            <ImageSlot
              label="Hero, establishing shot"
              spec="One finished project, wide. Building in full, shot straight on in good light."
              media={home?.hero}
              loading="eager"
            />
          </div>
        </div>

        <div className="container hero-index-wrap">
          <div className="hero-index reveal-group">
            {capabilities.map(({ number, title, copy }) => (
              <div key={number} className="hero-index-item" data-reveal>
                <span className="num">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT ─────────────────────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container statement-layout">
          <div className="statement-text" data-reveal>
            <h2 className="statement-title">
              Most construction websites are a template with a logo dropped in.
            </h2>

            <div className="statement-body">
              <p>
                A page builder can put a site online in a weekend. It will also look like every
                other site put online that weekend, and it will show your best project at the same
                size as your worst.
              </p>
              <p>
                If you sell high value work like commercial builds, structural jobs or custom
                interiors, you don&rsquo;t need a shopping cart. You need the work itself presented
                clearly enough that a client can judge it in thirty seconds.
              </p>
              <p>
                So I design each site from scratch, around your projects. One job, done properly.
              </p>
            </div>
          </div>

          <div className="statement-media bleed-right" data-reveal>
            <ImageSlot
              label="Approach, detail"
              spec="Close crop on craft: a material joint, a hand at work, a finished edge. Tall."
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
      {/* deliberately edge to edge — no container */}
      <section className="band full-media" data-reveal>
        <ImageSlot
          label="Band, atmosphere"
          spec="Edge-to-edge site or interior shot. Wide, quiet, no text overlay. A visual pause."
          media={home?.band}
        />
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
