'use client'

import React, { useCallback, useEffect, useRef } from 'react'

import { lockScroll, unlockScroll } from '@/lib/scroll-lock'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

type SlidePanelProps = {
  open: boolean
  onClose: () => void
  /** id of the element naming the panel, for aria-labelledby */
  labelledBy: string
  children: React.ReactNode
}

/**
 * Panel that slides in from the right over a dimmed page. Stays mounted so it
 * can animate both ways, and is marked `inert` while closed so its contents are
 * skipped by tab order and assistive tech.
 */
export default function SlidePanel({ open, onClose, labelledBy, children }: SlidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      // keep focus inside the panel while it's open
      const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) {
      // hand focus back to whatever opened the panel
      restoreTo.current?.focus()
      restoreTo.current = null
      return
    }

    restoreTo.current = document.activeElement as HTMLElement | null
    lockScroll()
    closeRef.current?.focus()
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockScroll()
    }
  }, [open, onKeyDown])

  return (
    <div className={`slide-panel-root ${open ? 'is-open' : ''}`} inert={!open}>
      <div className="slide-panel-backdrop" onClick={onClose} />

      <div
        ref={panelRef}
        className="slide-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        data-lenis-prevent
      >
        <button ref={closeRef} type="button" className="slide-panel-close" onClick={onClose}>
          Close
        </button>
        <div className="slide-panel-body">{children}</div>
      </div>
    </div>
  )
}
