import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { ContactTrigger } from '@/components/ContactPanel'
import RetainersSection from '@/components/RetainersSection'
import { ArrowRight } from '@/components/icons'
import { services } from '@/lib/services'
import { reveal } from '@/lib/reveal'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Websites built around completed projects, Google Business Profile management, and ongoing care. What each one includes, how a project runs, and what it costs.',
}

// what happens between the first email and launch day — the question every
// enquiry asks, and the reason this page exists rather than an anchor
const process = [
  {
    number: '01',
    title: 'Conversation',
    body: 'A call about the business, the work you want more of, and the projects worth leading with. No charge, no deck.',
  },
  {
    number: '02',
    title: 'Scope & price',
    body: 'A written scope against a fixed price. You know what is being built and what it costs before anything starts.',
  },
  {
    number: '03',
    title: 'Design & build',
    body: 'Drawn from scratch around your projects, then built. You see it in progress rather than at the end.',
  },
  {
    number: '04',
    title: 'Launch & after',
    body: 'Profile set up alongside the site, then a care plan keeps both current. Month to month, cancel whenever.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <section className="page-intro container">
        <div {...reveal}>
          <p className="eyebrow">Services</p>
          <h1>Three things, done properly.</h1>
        </div>
      </section>

      <section className="section container">
        <div className="statement" {...reveal}>
          <div>
            <h2>Most of this trade is sold as a package. I would rather quote the work.</h2>
          </div>
          <div>
            <p>
              A site, a profile that puts you on the map, and someone keeping both current. That is
              the whole offer. You can take one of the three or all of them.
            </p>
            <p>
              What follows is what each actually includes, so you can judge it before you email
              rather than after a sales call. Pricing for the ongoing work is at the bottom of this
              page; a new build is quoted against a written scope, because a fourteen project
              portfolio and a three page site are not the same job.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE THREE SERVICES ────────────────────────────────────────────── */}
      {/* rendered flat rather than behind panels: linkable, and a crawler sees it */}
      {services.map((service) => (
        <section key={service.slug} id={service.slug} className="service-section">
          <div className="container">
            <div className="service-detail">
              <div className="service-detail-head" {...reveal}>
                <span className="service-detail-num">{service.number}</span>
                <h2>{service.title}</h2>
              </div>

              <div className="service-detail-body" {...reveal}>
                <p className="lead">{service.summary}</p>

                {service.detail.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                <h3 className="service-detail-subhead">What&rsquo;s included</h3>
                <ul className="service-list">
                  {service.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <ContactTrigger className="link-arrow service-detail-cta" topic={service.topic}>
                  Enquire about {service.title.toLowerCase()}
                  <ArrowRight />
                </ContactTrigger>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── PROCESS ───────────────────────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head" {...reveal}>
            <div>
              <span className="eyebrow">How it runs</span>
              <h2>From first email to launch.</h2>
            </div>
          </div>

          <div className="process-grid reveal-group">
            {process.map(({ number, title, body }) => (
              <div key={number} className="process-step" {...reveal}>
                <span className="num">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARE PLANS ────────────────────────────────────────────────────── */}
      {/* lives here rather than on the home page: it is service pricing */}
      <RetainersSection />

      <section className="section container">
        <div className="statement" {...reveal}>
          <div>
            <h2>Not sure which one you need?</h2>
          </div>
          <div>
            <p>
              Most people start with the site and add the profile work once it is live. If you
              already have a site you are happy with, the local search and care work stand on their
              own.
            </p>
            <p className="about-links">
              <Link href="/work" className="link-arrow">
                See recent work
                <ArrowRight />
              </Link>
              <Link href="/about" className="link-arrow">
                About the studio
                <ArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* no closing call to action — the footer carries one on every page */}
    </>
  )
}
