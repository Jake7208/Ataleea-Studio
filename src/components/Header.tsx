'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import { siteConfig } from '@/site.config'
import { ContactTrigger, useContactPanel } from '@/components/ContactPanel'
import ThemeToggle from '@/components/ThemeToggle'
import AtaleeaLogo from './AtaleeaLogo'

export default function Header() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { open: openContact } = useContactPanel()

  const isActive = (href: string) =>
    href.startsWith('#') ? false : href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo" aria-label={`${siteConfig.name}, home`}>
          <AtaleeaLogo height={24} />
        </Link>

        {/* the toggle sits outside .site-nav so it survives the breakpoint that
            hides the nav behind the burger */}
        <div className="header-end">
          <ThemeToggle />

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
            <ContactTrigger className="btn btn-solid nav-cta">Start a project</ContactTrigger>
          </nav>

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
