'use client'

import React, { useState } from 'react'

import SlidePanel from '@/components/SlidePanel'
import { useContactPanel } from '@/components/ContactPanel'
import { ArrowRight } from '@/components/icons'
import type { ContactTopic } from '@/lib/contact-topics'

const services: {
  number: string
  title: string
  summary: string
  detail: string[]
  deliverables: string[]
  /** pre-selects the matching radio when the panel hands off to contact */
  topic: ContactTopic
}[] = [
  {
    number: '01',
    title: 'Project sites',
    topic: 'project',
    summary:
      'Image-led websites built around the work itself — completed projects, materials, process. No storefronts, no template padding.',
    detail: [
      'We start with the work. Before any layout exists we go through what you have built, pick the projects worth leading with, and decide what each one needs to prove to the person looking at it.',
      'The result is a site that behaves like a portfolio rather than a brochure: large images, restrained typography, and enough structure that a client or investor can judge the quality of your work in under a minute.',
    ],
    deliverables: [
      'Project galleries',
      'Case study pages',
      'Enquiry forms',
      'Built on a CMS you can edit',
    ],
  },
  {
    number: '02',
    title: 'Local search',
    topic: 'local',
    summary:
      'Google Business Profile set up properly and kept current, so the people searching for your trade in your area find you first.',
    detail: [
      'Most trade businesses lose local work to competitors with worse portfolios and better profiles. The profile is the storefront — categories, service areas, photos and reviews decide whether you appear in the map results at all.',
      'We set it up correctly once, then keep it fed. New project photos, service area accuracy, and a review workflow your team can actually keep up with.',
    ],
    deliverables: [
      'Profile setup & verification',
      'Categories & service areas',
      'Photo strategy',
      'Review workflow',
    ],
  },
  {
    number: '03',
    title: 'Content & care',
    topic: 'care',
    summary:
      'Hosting, updates and a steady trickle of new work published each month. The site stays fast, current and worth visiting.',
    detail: [
      'A site that never changes stops earning its keep. The difference between a portfolio that generates enquiries and one that sits there is whether anything new appears on it.',
      'We handle the hosting and the framework updates, and publish new projects as you finish them — so the site is always showing your most recent work rather than whatever was ready on launch day.',
    ],
    deliverables: [
      'Managed hosting',
      'Monthly project uploads',
      'Local landing pages',
      'Performance reporting',
    ],
  },
]

export const ServicesSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { open: openContact } = useContactPanel()
  const active = openIndex === null ? null : services[openIndex]

  // hand off from the service panel to the contact panel
  const startProject = () => {
    setOpenIndex(null)
    openContact(active?.topic)
  }

  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">Services</span>
            <h2>Three things, done properly.</h2>
          </div>
        </div>

        <div className="services-index">
          {services.map((service, i) => (
            <article key={service.number} className="service-row" data-reveal>
              <span className="service-num">{service.number}</span>

              <div className="service-main">
                <h3>
                  <button
                    type="button"
                    className="service-trigger"
                    onClick={() => setOpenIndex(i)}
                    aria-haspopup="dialog"
                  >
                    {service.title}
                  </button>
                </h3>
                <p>{service.summary}</p>
              </div>

              <span className="service-open" aria-hidden="true">
                <ArrowRight />
              </span>
            </article>
          ))}
        </div>
      </div>

      <SlidePanel
        open={active !== null}
        onClose={() => setOpenIndex(null)}
        labelledBy="service-panel-title"
      >
        {active && (
          <>
            <span className="eyebrow">Service / {active.number}</span>
            <h2 id="service-panel-title" className="slide-panel-title">
              {active.title}
            </h2>

            {active.detail.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h4 className="slide-panel-subhead">What&rsquo;s included</h4>
            <ul className="service-list">
              {active.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <button
              type="button"
              className="link-arrow slide-panel-cta"
              onClick={startProject}
              aria-haspopup="dialog"
            >
              Start a project
              <ArrowRight />
            </button>
          </>
        )}
      </SlidePanel>
    </section>
  )
}

export default ServicesSection
