'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import ContactForm from '@/components/ContactForm'
import SlidePanel from '@/components/SlidePanel'
import { siteConfig } from '@/site.config'
import type { ContactTopic } from '@/lib/contact-topics'

type ContactPanelValue = {
  /** Open the panel, optionally pre-selecting an enquiry topic. */
  open: (topic?: ContactTopic) => void
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

  const open = useCallback((next?: ContactTopic) => {
    setTopic(next)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <ContactPanelContext.Provider value={value}>
      {children}

      <SlidePanel open={isOpen} onClose={close} labelledBy="contact-panel-title">
        <span className="eyebrow">Contact</span>
        <h2 id="contact-panel-title" className="slide-panel-title">
          Tell us about the project.
        </h2>
        <p>
          A short note about your company and what you&rsquo;re trying to achieve is plenty to
          start. We reply within a day.
        </p>

        {/* remount on topic change so the form picks up the new default */}
        <ContactForm key={topic ?? 'default'} initialTopic={topic} />

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
  children,
}: {
  className?: string
  topic?: ContactTopic
  children: React.ReactNode
}) {
  const { open } = useContactPanel()
  return (
    <button type="button" className={className} onClick={() => open(topic)} aria-haspopup="dialog">
      {children}
    </button>
  )
}
