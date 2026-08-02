import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ContactTrigger } from '@/components/ContactPanel'
import AtaleeaLogo from './AtaleeaLogo'

const services = [
  { href: '/#services', label: 'Project sites' },
  { href: '/#services', label: 'Local search' },
  { href: '/#care', label: 'Care plans' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* closing call to action, on the footer's own dark ground */}
      <div className="container footer-lead">
        <h2 className="footer-lead-title">Got a project in mind?</h2>
        <ContactTrigger className="btn btn-light">Start a project</ContactTrigger>
      </div>

      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" aria-label={`${siteConfig.name} — home`}>
              <AtaleeaLogo height={26} />
            </Link>
            <p className="footer-blurb">
              A design studio for people who build things — websites, photography and local search
              for trades and service companies.
            </p>
          </div>

          <div className="footer-col">
            <h4>Studio</h4>
            <ul className="footer-links">
              {siteConfig.nav.map(({ href, label }) => (
                <li key={`${href}${label}`}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul className="footer-links">
              {services.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li>
                <span>{siteConfig.location.line2}</span>
              </li>
              {siteConfig.social.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.author}
          </span>
          <span>{siteConfig.location.line1}</span>
        </div>
      </div>
    </footer>
  )
}
