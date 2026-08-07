import React from 'react'

import Testimonials, { type TestimonialCard } from '@/components/Testimonials'
import { reveal } from '@/lib/reveal'

export default function TestimonialsSection({ items }: { items: TestimonialCard[] }) {
  if (items.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" {...reveal}>
          <div>
            <span className="eyebrow">Clients</span>
            <h2>What they say.</h2>
          </div>
        </div>

        <Testimonials items={items} />
      </div>
    </section>
  )
}
