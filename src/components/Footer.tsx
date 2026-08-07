import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ContactTrigger } from '@/components/ContactPanel'
import NewsletterForm from '@/components/NewsletterForm'
import AtaleeaLogo from './AtaleeaLogo'
import FooterWordmark from './FooterWordmark'

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
      {/* Closing call to action, back on the footer's own dark ground. It was
          briefly a full-bleed lime band, which on a short page like /work was
          16% of the screen in the accent on its own. The lime is carried by the
          button now, which is the size the accent is meant to be. */}
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
              Websites for people with work worth showing.
            </p>
          </div>

          <div className="footer-col">
            {/* h3, not h4: the footer's own h2 is the call to action above, so
                h4 skipped a level. The label styling is .footer-col's, not the
                tag's. */}
            <h3>Studio</h3>
            <ul className="footer-links">
              {siteConfig.nav.map(({ href, label }) => (
                <li key={`${href}${label}`}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Services</h3>
            <ul className="footer-links">
              {services.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact</h3>
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

        {/* Quieter than the call to action at the top of the footer, and below
            the columns rather than beside them. "Start a project" is the thing
            this footer asks for; a second boxed pitch level with it would make
            the reader choose between two asks instead of noticing one. This is
            the small yes for someone not ready to make the large one. */}
        <div className="footer-newsletter">
          <div className="footer-newsletter-copy">
            <h3>Newsletter</h3>
            <p>
              What we publish, once a month. New work, what went into it, and what is worth
              knowing about getting found online. No more than that.
            </p>
          </div>
          <NewsletterForm source="footer" />
        </div>

        {/* The right-hand slot used to repeat siteConfig.location.line1, which is
            the same "Ataleea LLC" already sitting in the copyright line beside
            it. The privacy policy has to be reachable from every page, and this
            is where a reader looks for it. */}
        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.author}
          </span>
          <Link href="/privacy">Privacy</Link>
        </div>

        {/* Oversized wordmark closing the footer. This is the largest single
            piece of the accent on the site, and it is deliberately type rather
            than a panel: it puts the lime on the page at a size you actually
            register without ever becoming a ground for something else to sit
            on. aria-hidden because the studio name is already the first link
            in the footer, and a screen reader does not need it twice. */}
        <FooterWordmark />
      </div>
    </footer>
  )
}
