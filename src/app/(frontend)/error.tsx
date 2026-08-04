'use client'

import Link from 'next/link'
import React, { useEffect } from 'react'

import { ArrowRight } from '@/components/icons'

/**
 * Catches render errors in the front-end routes so a failure still arrives
 * inside the site's own layout rather than as an unstyled stack trace.
 *
 * Error boundaries have to be client components, and this one can't render
 * `metadata` — Next handles the status itself.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // the digest is what ties this to the entry in the server logs
    console.error('Front-end route error:', error.digest ?? error.message)
  }, [error])

  return (
    <>
      <section className="page-intro container">
        <div>
          <p className="eyebrow">Error</p>
          <h1>Something went wrong at our end.</h1>
        </div>
      </section>

      <section className="section container">
        <div className="statement">
          <div>
            <h2>Not you — this one&rsquo;s on the site.</h2>
          </div>
          <div>
            <p>
              Try again in a moment. If it keeps happening I&rsquo;d rather hear about it than not,
              so drop me a line and say what you were looking at.
            </p>
            <p className="about-links">
              <button type="button" className="link-arrow" onClick={reset}>
                Try again
                <ArrowRight />
              </button>
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
