'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import ContactForm from '@/components/ContactForm'
import SlidePanel from '@/components/SlidePanel'
import { siteConfig } from '@/site.config'
import type { ContactTopic } from '@/lib/contact-topics'
import type { PlanId } from '@/lib/plans'

type ContactPanelValue = {
  /** Open the panel, optionally pre-selecting an enquiry topic and care plan. */
  open: (topic?: ContactTopic, plan?: PlanId) => void
  close: () => void
}

const ContactPanelContext = createContext<ContactPanelValue | null>(null)

/** Opens the site-wide contact panel. Available on every page. */
export function useContactPanel() {
  const ctx = useContext(ContactPanelContext)
  if (!ctx) throw new Error('useContactPanel must be used inside <ContactPanelProvider>')
  return ctx
}

export function ContactPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [topic, setTopic] = useState<ContactTopic | undefined>()
  const [plan, setPlan] = useState<PlanId | undefined>()
  /**
   * Whether the panel has ever been opened.
   *
   * The form carries a Turnstile widget, and Turnstile loads a Cloudflare iframe
   * the moment it mounts — so rendering the form eagerly put a third-party frame,
   * its script and its network chatter on every page of the site, including case
   * studies nobody opens the form from. Gating on this defers all of that until
   * someone actually asks for the panel.
   *
   * Sticky rather than tracking `isOpen`, so closing the panel does not throw
   * away what has been typed into it.
   */
  const [hasOpened, setHasOpened] = useState(false)

  const open = useCallback((nextTopic?: ContactTopic, nextPlan?: PlanId) => {
    setTopic(nextTopic)
    setPlan(nextPlan)
    setIsOpen(true)
    setHasOpened(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <ContactPanelContext.Provider value={value}>
      {children}

      <SlidePanel open={isOpen} onClose={close} labelledBy="contact-panel-title">
        <span className="eyebrow">Contact</span>
        <h2 id="contact-panel-title" className="slide-panel-title">
          Tell me about the project.
        </h2>
        <p>
          A short note about your company and what you&rsquo;re trying to achieve is plenty to
          start. I reply within a day.
        </p>

        {/* remount when either default changes so the form picks them up */}
        {hasOpened && (
          <ContactForm
            key={`${topic ?? 'default'}-${plan ?? 'none'}`}
            initialTopic={topic}
            initialPlan={plan}
          />
        )}

        <div className="contact-detail">
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </div>
      </SlidePanel>
    </ContactPanelContext.Provider>
  )
}

/** Button that opens the contact panel — drop-in replacement for the old links. */
export function ContactTrigger({
  className = 'btn btn-solid',
  topic,
  plan,
  children,
}: {
  className?: string
  topic?: ContactTopic
  /** pre-selects a care plan, for the Enquire button on a specific plan */
  plan?: PlanId
  children: React.ReactNode
}) {
  const { open } = useContactPanel()
  return (
    <button
      type="button"
      className={className}
      onClick={() => open(topic, plan)}
      aria-haspopup="dialog"
    >
      {children}
    </button>
  )
}
