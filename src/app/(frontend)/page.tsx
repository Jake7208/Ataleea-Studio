import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import { ContactTrigger } from '@/components/ContactPanel'
import FaqSection from '@/components/FaqSection'
import ImageSlot from '@/components/ImageSlot'
import ServicesSection from '@/components/ServicesSection'
import RetainersSection from '@/components/RetainersSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import WorkShowcaseSection from '@/components/WorkShowcaseSection'
import { ArrowRight } from '@/components/icons'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

const capabilities = [
  {
    number: '01',
    title: 'Design & build',
    copy: 'Websites shaped around the work — projects, materials, process.',
  },
  {
    number: '02',
    title: 'Local search',
    copy: 'Found first by the people searching for your trade nearby.',
  },
  {
    number: '03',
    title: 'Ongoing care',
    copy: 'Hosting, updates and new work published every month.',
  },
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [featuredRes, testimonialRes, faqRes] = await Promise.all([
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
  ])

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
              Ataleea Studio designs restrained, image-led websites for contractors, trades and
              service companies — then keeps them found on local search.
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
              label="Hero — establishing shot"
              spec="One finished project, wide. Building in full, shot straight on in good light."
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
              Most trade websites are built to sell templates, not work.
            </h2>

            <div className="statement-body">
              <p>
                If you sell high-value services — commercial builds, structural work, custom
                interiors — you don&rsquo;t need a shopping cart. You need the work itself
                presented clearly enough that a client or investor can judge it in thirty seconds.
              </p>
              <p>
                We build sites that do one job well: show what you&rsquo;ve made, in the best
                light, to the people already looking for it.
              </p>
            </div>
          </div>

          <div className="statement-media bleed-right" data-reveal>
            <ImageSlot
              label="Approach — detail"
              spec="Close crop on craft: a material joint, a hand at work, a finished edge. Tall."
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
          label="Band — atmosphere"
          spec="Edge-to-edge site or interior shot. Wide, quiet, no text overlay — a visual pause."
        />
      </section>

      {/* ── CARE PLANS ────────────────────────────────────────────────────── */}
      <RetainersSection />

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <TestimonialsSection items={testimonialRes.docs} />

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      {/* the closing call to action lives in the footer, on every page */}
      <FaqSection items={faqRes.docs} />
    </>
  )
}
