import React from 'react'

import { ContactTrigger } from '@/components/ContactPanel'
import { ArrowRight } from '@/components/icons'
import { CARE_PLANS } from '@/lib/plans'
import { reveal } from '@/lib/reveal'

// Deliberately not 'use client': nothing here is interactive. The only client
// piece is <ContactTrigger>, which is its own client component and renders fine
// from the server — so the plan data and markup stay off the client bundle.

export const RetainersSection: React.FC = () => (
  <section id="care" className="section section-dark">
    <div className="container">
      <div className="section-head" {...reveal}>
        <div>
          <span className="eyebrow">Ongoing</span>
          <h2>Care plans, no contracts.</h2>
        </div>
      </div>

      <div className="plan-grid reveal-group">
        {CARE_PLANS.map((plan) => (
          <div key={plan.id} className="plan" {...reveal}>
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-desc">{plan.description}</p>

            <div className="plan-price">
              {plan.price}
              <span>{plan.period}</span>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <ContactTrigger className="link-arrow" topic="care" plan={plan.id}>
              Enquire
              <ArrowRight />
            </ContactTrigger>
          </div>
        ))}

        {/* Third column, and deliberately not a third plan. A build is quoted
            against a written scope, so a price here would be a guess — and
            given a monthly figure either side of it, a guess that reads as the
            top tier. It is sold properly further up the page; this is the
            pointer back to it for someone who scrolled straight to pricing. */}
        <div className="plan plan-aside" {...reveal}>
          <h3 className="plan-name">Building the site itself</h3>
          <p className="plan-desc">
            A new build is quoted against a written scope, not billed monthly. A fourteen project
            portfolio and a three page site are not the same job, so they should not carry the same
            number.
          </p>
          <p className="plan-desc">Either plan above can start the day it goes live.</p>

          <a href="#project-sites" className="link-arrow">
            What a build includes
            <ArrowRight />
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default RetainersSection
