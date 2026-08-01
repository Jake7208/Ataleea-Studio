import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import { siteConfig } from '@/site.config'
import CaseStudyGrid from '@/components/CaseStudyGrid'
import JournalList from '@/components/JournalList'
import Testimonials from '@/components/Testimonials'
import { pickShowcase } from '@/lib/showcase'

// statically rendered, refreshed in the background at most once a minute
export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [featuredRes, journalRes, testimonialRes] = await Promise.all([
    payload.find({
      collection: 'case-studies',
      where: { _status: { not_equals: 'draft' } },
      limit: 4,
      sort: '-publishedAt',
      depth: 1,
      select: {
        title: true,
        slug: true,
        roles: true,
        year: true,
        mainMedia: true,
        tags: true,
        // the hero races this against the newest blog post
        publishedAt: true,
      },
    }),
    payload.find({
      collection: 'blog',
      where: { _status: { not_equals: 'draft' } },
      limit: 3,
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
    }),
    payload.find({
      collection: 'testimonials',
      where: { featured: { equals: true } },
      limit: 6,
      // drag order from the admin list view
      sort: '_order',
      depth: 1,
      select: {
        name: true,
        role: true,
        company: true,
        companyLogo: true,
        image: true,
        quote: true,
      },
    }),
  ])

  const featured = featuredRes.docs
  const journal = journalRes.docs
  const testimonials = testimonialRes.docs
  // the hero card showcases whichever went out most recently — case study or post
  const latest = pickShowcase(featured[0], journal[0])

  return (
    <>
      <section className="hero container">
        {/* HERO — replace with your headline and intro */}
        <h1>HERO_HEADLINE</h1>
        <p>HERO_SUBLINE</p>
        <p>
          <Link href="/work">View work</Link> <Link href="/contact">Get in touch</Link>
        </p>

        {latest && (
          <Link href={latest.href} className="hero-latest">
            <span>{latest.eyebrow}</span> <strong>{latest.title}</strong>
            {latest.meta && <span> — {latest.meta}</span>}
          </Link>
        )}
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>About</h2>
        </div>
        <div className="about-grid">
          {/* ABOUT — a short paragraph about you / the studio */}
          <p>ABOUT_TEXT</p>
          <dl className="about-facts">
            <div>
              <dt>Currently</dt>
              <dd>FACT_1</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>FACT_2</dd>
            </div>
            <div>
              <dt>Located</dt>
              <dd>{siteConfig.location.line1}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Work</h2>
          <Link href="/work">All work</Link>
        </div>
        {featured.length > 0 ? (
          <CaseStudyGrid posts={featured} />
        ) : (
          <div className="empty-state">
            <p>Nothing here yet — publish a case study in the admin panel.</p>
          </div>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <h2>Kind words</h2>
          </div>
          <Testimonials items={testimonials} />
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <h2>Blog</h2>
          <Link href="/blog">All posts</Link>
        </div>
        {journal.length > 0 ? (
          <JournalList posts={journal} />
        ) : (
          <div className="empty-state">
            <p>Nothing published yet — the first post is coming.</p>
          </div>
        )}
      </section>
    </>
  )
}
