import type { Metadata } from 'next'
import React from 'react'

import { siteConfig } from '@/site.config'
import { reveal } from '@/lib/reveal'

export const metadata: Metadata = {
  title: 'Privacy',
  description: `What ${siteConfig.name} collects, why, who else sees it, and how to have it deleted.`,
  // A policy page has no business in search results competing with the work,
  // but it must stay reachable and indexable enough to be verifiable.
  robots: { index: true, follow: true },
}

/**
 * Written against what the site actually does rather than from a template.
 *
 * Every claim below is checkable in the code: the fields are the ones declared
 * on the ContactSubmissions and Subscribers collections, and the "no analytics"
 * claim holds as long as nothing is added to layout.tsx. If any of those
 * change, this changes.
 */
const UPDATED = 'August 5, 2026'

export default function PrivacyPage() {
  return (
    <>
      <section className="page-intro container">
        <div {...reveal}>
          <p className="eyebrow">Privacy</p>
          <h1>What this site collects.</h1>
          <p className="page-intro-lead">
            A short, honest account of the information {siteConfig.name} holds, why it exists, and
            how to have it removed. Last updated {UPDATED}.
          </p>
        </div>
      </section>

      <section className="container legal">
        <h2>The short version</h2>
        <p>
          This site has no analytics, no advertising, no tracking pixels and no third-party
          cookies. Nothing you do here is profiled, and nothing is ever sold or shared for
          marketing. The only personal information held is what you deliberately type into a form.
        </p>

        <h2>What is collected, and when</h2>

        <h3>If you use the contact form</h3>
        <p>
          Your name, email address, the topic you picked and the message you wrote. It is stored so
          there is a record of the enquiry, and emailed to the studio so it can be answered. That
          is the whole of it. Sending an enquiry does not put you on the newsletter, which is a
          separate list you have to join yourself.
        </p>

        <h3>If you join the newsletter</h3>
        <p>
          Your email address, the date you signed up and which form you used. The date and the
          form are kept as the record of when and where you agreed, so there is an answer if you
          ever ask. The list is used for the monthly newsletter and nothing else. It is never sold,
          shared or rented, and every send carries a one-click unsubscribe.
        </p>

        <h3>Ordinary server records</h3>
        <p>
          Like every website, the servers that deliver these pages keep short-lived request logs
          which include IP addresses. They exist to keep the site running and to investigate abuse,
          and are not used to build any profile of you.
        </p>

        <h2>Cookies</h2>
        <p>
          This site sets no tracking or advertising cookies, which is why you have not been asked
          to consent to any.
        </p>
        <p>
          If you switch between light and dark mode, that choice is saved in your browser&rsquo;s
          own local storage so the site remembers it next time. It never leaves your device and is
          never sent to a server. Clearing your browser data removes it.
        </p>
        <p>
          The spam protection on the contact and newsletter forms is Cloudflare Turnstile, which
          may set a cookie strictly to tell a person from a bot. It loads only once you actually
          use one of those forms, not on ordinary pages, and it is not used for tracking or
          advertising.
        </p>

        <h2>Who else handles it</h2>
        <p>
          A handful of services are involved in running the site. Each sees only what it needs to
          do its job, and none of them are given information for marketing.
        </p>
        <ul className="legal-list">
          <li>
            <strong>Cloudflare</strong> — stores and delivers the images and video on this site,
            and provides the Turnstile spam protection on the forms.
          </li>
          <li>
            <strong>Resend</strong> — delivers the email that a contact form submission generates.
          </li>
          <li>
            <strong>MongoDB</strong> — the database the site&rsquo;s content and form submissions
            are stored in.
          </li>
        </ul>

        <h2>How long it is kept</h2>
        <p>
          Contact enquiries are kept while they are useful — an active conversation, or a record of
          work discussed — and deleted once they are not. Newsletter addresses are kept until you
          unsubscribe. An unsubscribed address is marked as such rather than deleted outright, so a
          later import cannot quietly put you back on the list; ask and it is removed for good.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask what is held about you, ask for it to be corrected, or ask for it to be
          deleted outright. Email{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> and it will be handled — no
          particular form of words is needed, and there is no charge.
        </p>
        <p>
          Depending on where you live you may have further rights under laws such as the GDPR or
          the CCPA, including the right to object to processing or to complain to a regulator.
          Requests are treated the same way regardless of where they come from.
        </p>

        <h2>Children</h2>
        <p>
          This site is aimed at businesses and is not directed at children. Information is not
          knowingly collected from anyone under 13.
        </p>

        <h2>Changes</h2>
        <p>
          If what the site collects changes, this page changes with it and the date at the top is
          updated. There is no version history to dig through — what is written here is what the
          site currently does.
        </p>

        <h2>Getting in touch</h2>
        <p>
          {siteConfig.author}, {siteConfig.location.line2}. Any question about this page, or about
          information the site holds, goes to{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      </section>
    </>
  )
}
