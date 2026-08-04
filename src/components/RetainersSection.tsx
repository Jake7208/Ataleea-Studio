import React from 'react'

import { ContactTrigger } from '@/components/ContactPanel'
import { ArrowRight } from '@/components/icons'

// Deliberately not 'use client': nothing here is interactive. The only client
// piece is <ContactTrigger>, which is its own client component and renders fine
// from the server — so the plan data and markup stay off the client bundle.

const plans = [
  {
    name: 'Care',
    price: '$299',
    period: 'per month',
    description: 'Hosting, backups and updates so the site stays fast and secure.',
    features: [
      'Managed hosting & SSL',
      'Daily backups, uptime monitoring',
      'Framework & security updates',
      'One project added per month',
    ],
  },
  {
    name: 'Growth',
    price: '$599',
    period: 'per month',
    description: 'Everything in Care, plus active local search and a steady publishing rhythm.',
    features: [
      'Everything in Care',
      'Google Business Profile management',
      'Two articles published monthly',
      'Up to three new projects monthly',
      'Monthly search & enquiry report',
    ],
  },
  {
    name: 'Studio',
    price: 'Custom',
    period: 'by quote',
    description: 'A new site designed and built end to end, with ongoing care once it ships.',
    features: [
      'Full design & build',
      'Photography direction',
      'Profile setup & optimisation',
      'Copywriting support',
    ],
  },
]

export const RetainersSection: React.FC = () => (
  <section id="care" className="section section-dark">
    <div className="container">
      <div className="section-head" data-reveal>
        <div>
          <span className="eyebrow">Ongoing</span>
          <h2>Care plans, no contracts.</h2>
        </div>
      </div>

      <div className="plan-grid reveal-group">
        {plans.map((plan) => (
          <div key={plan.name} className="plan" data-reveal>
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

            <ContactTrigger className="link-arrow" topic="care">
              Enquire
              <ArrowRight />
            </ContactTrigger>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default RetainersSection
