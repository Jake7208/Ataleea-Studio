import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ArrowRight } from '@/components/icons'
import { reveal } from '@/lib/reveal'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Ataleea is a one person studio building websites for people with work worth showing. Portfolios, practices and independent businesses.',
}

// how the studio works, rather than what it sells — the services section
// already covers the latter
const principles = [
  {
    number: '01',
    title: 'Direct',
    body: 'You work with me from the first conversation to the last. No account manager in between, no handing the build off to a team you never meet.',
  },
  {
    number: '02',
    title: 'Small',
    body: 'A few projects at a time. It means yours gets built rather than queued, and that I can say no to work I am not right for.',
  },
  {
    number: '03',
    title: 'Plain',
    body: 'Scope agreed up front, a fixed price against it, and no contract you cannot walk away from. The care plans are month to month for the same reason.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="page-intro container">
        <div {...reveal}>
          <p className="eyebrow">About</p>
          <h1>A studio for work worth showing.</h1>
        </div>
      </section>

      <section className="section section-dark container">
        <div className="statement" {...reveal}>
          <div>
            <h2>Ataleea is a small studio, and I run it.</h2>
          </div>
          <div>
            <p>
              I build websites for people whose strongest argument is the work itself. Finished
              projects, research, results. Shown properly, and put somewhere the right person can
              actually find it.
            </p>
            <p>
              Most of the people I work with are very good at what they do and badly served by the
              site representing it. A template flattens years of craft into a stock photo and a
              contact form. I start from the other end: the work you have finished, the decisions
              you made, the detail you would point at if the client were standing next to you.
            </p>
            <p>
              That is the whole idea. Show the work, make it findable, and keep it current once
              launch day is over.
            </p>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head" {...reveal}>
          <div>
            <span className="eyebrow">How I work</span>
            <h2>Three habits, not a process diagram.</h2>
          </div>
        </div>

        <div className="hero-index reveal-group">
          {principles.map(({ number, title, body }) => (
            <div key={number} className="hero-index-item" {...reveal}>
              <span className="num">{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* No lime block here, unlike /services and the home page. About is the
          shortest page on the site, and a full lime section on it put the
          accent past 19% on its own — the closing band is enough. */}
      <section className="section container">
        <div className="statement" {...reveal}>
          <div>
            <h2>What that looks like in practice.</h2>
          </div>
          <div>
            <p>
              Three things, mostly: a site built around your completed work, local search set up
              properly if you serve an area, and someone keeping it all current afterwards.
            </p>
            <p>
              If you want the detail on what is included, what it costs and how long it takes,
              it is all written out on the services page.
            </p>
            <p className="about-links">
              <Link href="/services" className="link-arrow">
                Services and plans
                <ArrowRight />
              </Link>
              <Link href="/work" className="link-arrow">
                Recent work
                <ArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* no button here — the footer's "Start a project" lands immediately below.
          This block is the other channel: a plain address for people who would
          rather write than fill anything in. */}
      <section className="section container">
        <div className="about-studio" {...reveal}>
          <div>
            <span className="eyebrow">Studio</span>
            <p className="lead">
              If you would rather write a couple of lines than fill in a form, this reaches me
              directly. I reply within a day.
            </p>
          </div>
          <a className="about-studio-email" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </div>
      </section>
    </>
  )
}
