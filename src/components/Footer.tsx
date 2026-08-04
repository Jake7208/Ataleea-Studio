import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ContactTrigger } from '@/components/ContactPanel'
import AtaleeaLogo from './AtaleeaLogo'

const services = [
  { href: '/services#project-sites', label: 'Project sites' },
  { href: '/services#local-search', label: 'Local search' },
  { href: '/services#care', label: 'Care plans' },
  // off the header now that About has the slot, but still worth reaching
  { href: '/#faq', label: 'Common questions' },
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
            <Link href="/" aria-label={`${siteConfig.name}, home`}>
              <AtaleeaLogo height={26} />
            </Link>
            {/* Two products, not three. Photography is something the studio can
                do when a client has none — it isn't sold on its own, and listing
                it here read as "we shoot", which overstates it. The FAQ covers
                what actually happens about photos. */}
            <p className="footer-blurb">
              Websites and local search for construction companies and the trades around them.
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
              {/* an entry still parked on '#' has no destination yet — skip it
                  rather than ship a link that goes nowhere */}
              {siteConfig.social
                .filter(({ href }) => href && href !== '#')
                .map(({ label, href }) => (
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
