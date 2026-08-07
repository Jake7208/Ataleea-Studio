'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { siteConfig } from '@/site.config'
import { ContactTrigger, useContactPanel } from '@/components/ContactPanel'
import ThemeToggle from '@/components/ThemeToggle'
import { lockScroll, unlockScroll } from '@/lib/scroll-lock'
import AtaleeaLogo from './AtaleeaLogo'

/** Under this the bar is still over the first screen, and stays bare. */
const GROUND_AT = 24
/** Nothing retracts until there is a screenful above to come back to. */
const RETRACT_AFTER = 320
/** Trackpads and Lenis both emit sub-pixel drift at rest; ignore it. */
const NOISE = 4

type HeaderState = 'top' | 'pinned' | 'hidden'

/**
 * Where the header is in relation to the page: bare over the first screen,
 * grounded once content is passing underneath it, retracted while the reader
 * is heading down.
 *
 * Lenis scrolls the window itself rather than transforming a wrapper, so
 * window.scrollY is the real position and a plain listener sees every frame.
 */
function useHeaderState(): HeaderState {
  const pathname = usePathname()
  const [state, setState] = useState<HeaderState>('top')
  const lastY = useRef(0)

  useEffect(() => {
    // Retracting is the only part of this that is motion for its own sake, so
    // it is the only part that goes away here. The ground and the hairline are
    // information — they say there is page behind this bar — and someone who
    // asked for less movement still wants to be told that.
    const mayRetract = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const read = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY.current

      // Jitter is only worth ignoring away from the top. Within GROUND_AT the
      // state is decided by position alone, so let it settle exactly.
      if (y > GROUND_AT && Math.abs(delta) < NOISE) return

      if (y <= GROUND_AT) setState('top')
      else if (mayRetract && delta > 0 && y > RETRACT_AFTER) setState('hidden')
      else setState('pinned')

      lastY.current = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    // a reload restores its scroll position before this ever runs
    read()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // SmoothScroll places every new route itself, and does it immediately rather
  // than animating. That lands without the run of scroll events the listener
  // above infers direction from, so the new page would open carrying the last
  // one's state — most visibly as a header retracted off the top of a page the
  // reader has not scrolled.
  useEffect(() => {
    const y = window.scrollY
    lastY.current = y
    requestAnimationFrame(() => {
      setState(y <= GROUND_AT ? 'top' : 'pinned')
    })
  }, [pathname])

  return state
}

export default function Header() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { open: openContact } = useContactPanel()
  const headerState = useHeaderState()

  // The open menu covers the page and dims what it doesn't cover, so the page
  // behind it should not still be scrolling. lockScroll is ref-counted, which
  // matters here: tapping "Start a project" closes this and opens the contact
  // panel, and the panel takes its own lock on the way through.
  useEffect(() => {
    if (!mobileNavOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    lockScroll()
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockScroll()
    }
  }, [mobileNavOpen])

  const isActive = (href: string) =>
    href.startsWith('#') ? false : href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`site-header ${mobileNavOpen ? 'mobile-nav-open' : ''}`}
      data-state={headerState}
    >
      <div className="container site-header-inner">
        <Link href="/" className="logo" aria-label={`${siteConfig.name}, home`}>
          <AtaleeaLogo height={24} />
        </Link>

        {/* Navigation, rule, controls. The toggle and the burger sit outside
            .site-nav so they survive the breakpoint that hides it. */}
        <div className="header-end">
          <nav className="site-nav">
            {siteConfig.nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          <span className="header-divider" aria-hidden="true" />

          <ThemeToggle />

          <ContactTrigger className="btn btn-solid nav-cta">Start a project</ContactTrigger>

          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
          >
            {/* two bars that rotate into a cross — see .burger in styles.css */}
            <span className="burger" aria-hidden="true">
              <span className="burger-bar" />
              <span className="burger-bar" />
            </span>
          </button>
        </div>
      </div>

      {/* Dismissable, because a scrim you cannot tap out of is a trap. Not a
          button and not focusable — Escape and the burger both close this, so
          it is duplicate reach for anyone on a keyboard. */}
      <div
        className={`mobile-nav-scrim ${mobileNavOpen ? 'is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* stays mounted so it can animate closed; inert while hidden */}
      <div
        id="mobile-nav"
        className={`mobile-nav ${mobileNavOpen ? 'is-open' : ''}`}
        inert={!mobileNavOpen}
      >
        {siteConfig.nav.map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            style={{ '--i': i } as React.CSSProperties}
            onClick={() => setMobileNavOpen(false)}
          >
            {label}
          </Link>
        ))}
        <button
          type="button"
          className="btn btn-solid"
          style={{ '--i': siteConfig.nav.length } as React.CSSProperties}
          aria-haspopup="dialog"
          onClick={() => {
            setMobileNavOpen(false)
            openContact()
          }}
        >
          Start a project
        </button>
      </div>
    </header>
  )
}
