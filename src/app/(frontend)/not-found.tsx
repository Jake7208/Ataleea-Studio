import Link from 'next/link'
import React from 'react'

import { ArrowRight } from '@/components/icons'
import { reveal } from '@/lib/reveal'

// No `metadata` export here — Next ignores it on not-found.tsx. The title and
// the noindex are set by the [...notFound] catch-all that renders this.
export default function NotFound() {
  return (
    <>
      <section className="page-intro container">
        <div {...reveal}>
          <p className="eyebrow">404</p>
          <h1>That page isn&rsquo;t here.</h1>
        </div>
      </section>

      <section className="section container">
        <div className="statement" {...reveal}>
          <div>
            <h2>It may have moved, or never existed.</h2>
          </div>
          <div>
            <p>
              Either way, the work and the services are a click away. If you followed a link from
              somewhere and landed here, I&rsquo;d like to know about it.
            </p>
            <p className="about-links">
              <Link href="/work" className="link-arrow">
                See the work
                <ArrowRight />
              </Link>
              <Link href="/services" className="link-arrow">
                Services
                <ArrowRight />
              </Link>
              <Link href="/" className="link-arrow">
                Back home
                <ArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
