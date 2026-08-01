import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'

export default function Footer() {
  return (
    <footer className="site-footer container">
      <div className="footer-cta">
        {/* FOOTER CTA — a short invitation to get in touch */}
        <h2>FOOTER_CTA_HEADLINE</h2>
        <Link href="/contact">Get in touch</Link>
      </div>

      <div className="footer-grid">
        <div>
          <p className="footer-head">Menu</p>
          <nav className="footer-col">
            {siteConfig.nav.map(({ href, label }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="footer-head">Elsewhere</p>
          <div className="footer-col">
            {siteConfig.social.map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
        </div>
        <div>
          <p className="footer-head">Location</p>
          <div className="footer-col">
            <span>{siteConfig.location.line1}</span>
            <span>{siteConfig.location.line2}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} {siteConfig.author}
        </span>
      </div>
    </footer>
  )
}
