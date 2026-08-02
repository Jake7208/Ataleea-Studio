import React from 'react'

import type { Faq } from '@/payload-types'
import RichTextBody from '@/components/RichTextBody'

export type FaqItem = Pick<Faq, 'id' | 'question' | 'answer'>

/**
 * Native <details> rather than a JS accordion: the answers stay in the DOM for
 * crawlers, and it opens without JavaScript. Motion is limited to the marker
 * and a fade on the answer, which <details> can do on its own.
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null

  return (
    <section id="faq" className="section section-alt">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Common questions.</h2>
          </div>
        </div>

        <div className="faq-list">
          {items.map((item) => (
            <details key={item.id} className="faq-item" data-reveal>
              <summary className="faq-question">
                {item.question}
                <span className="faq-marker" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <RichTextBody data={item.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
