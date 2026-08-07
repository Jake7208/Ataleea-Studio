import Link from 'next/link'
import React from 'react'

import { ArrowRight } from '@/components/icons'
import { services } from '@/lib/services'
import { reveal } from '@/lib/reveal'

/**
 * Home page teaser. Title and summary only — the detail, the deliverables and
 * the pricing live on /services, where they're linkable and indexable. Each row
 * deep-links to its own section there.
 */
export const ServicesSection: React.FC = () => (
  <section id="services" className="section">
    <div className="container">
      <div className="section-head" {...reveal}>
        <div>
          <span className="eyebrow">Services</span>
          <h2>Three things, done properly.</h2>
        </div>

        <Link href="/services" className="link-arrow">
          All services
          <ArrowRight />
        </Link>
      </div>

      <div className="services-index">
        {services.map((service) => (
          <article key={service.slug} className="service-row" {...reveal}>
            <h3 className="service-head">
              {/* decorative: the heading should read as the title alone */}
              <span className="service-num" aria-hidden="true">
                {service.number}
              </span>

              {/* ::after on this link makes the whole row the hit area */}
              <Link href={`/services#${service.slug}`} className="service-trigger">
                {service.title}
                <ArrowRight className="service-arrow" />
              </Link>
            </h3>

            <p className="service-summary">{service.summary}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default ServicesSection
