import React from 'react'

import type { Faq } from '@/payload-types'
import FaqMotion from '@/components/FaqMotion'
import RichTextBody from '@/components/RichTextBody'
import { reveal } from '@/lib/reveal'

export type FaqItem = Pick<Faq, 'id' | 'question' | 'answer'>

/**
 * Native <details> rather than a JS accordion: the answers stay in the DOM for
 * crawlers, and it opens without JavaScript.
 *
 * On its own that gets the marker and a one-way fade, which is all <details>
 * can do — see FaqMotion, which upgrades it to an animated open and close where
 * JavaScript is available without this markup changing.
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null

  return (
    <section id="faq" className="section section-alt">
      <div className="container">
        <div className="section-head" {...reveal}>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Common questions.</h2>
          </div>
        </div>

        <div className="faq-list">
          {items.map((item) => (
            <details key={item.id} className="faq-item" {...reveal}>
              <summary className="faq-question">
                {item.question}
                <span className="faq-marker" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  <RichTextBody data={item.answer} />
                </div>
              </div>
            </details>
          ))}
        </div>

        <FaqMotion />
      </div>
    </section>
  )
}
