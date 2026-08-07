'use client'

import React, { useCallback, useId, useState } from 'react'

import Turnstile, { turnstileEnabled } from '@/components/Turnstile'
import { ArrowRight } from '@/components/icons'
import { TURNSTILE_HEADER } from '@/lib/turnstile-header'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Newsletter sign-up. Lives in the footer, so it is on every page.
 *
 * Turnstile is not mounted until someone touches the field. The widget loads a
 * Cloudflare iframe the moment it renders, and this component is in the footer
 * of every route — mounting it eagerly would put a third-party frame, its
 * script and its network chatter on every page of the site to guard a field
 * most readers never use. Same reasoning as the contact panel's `hasOpened`
 * gate, arrived at for the same reason.
 */
export default function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const fieldId = useId()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  /** Flipped by the first focus on the field — see the note above. */
  const [engaged, setEngaged] = useState(false)
  // Turnstile tokens are single use — bumping this remounts the widget for a
  // fresh one after a failed attempt
  const [challenge, setChallenge] = useState(0)

  const onToken = useCallback((next: string | null) => setToken(next), [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address.')
    if (turnstileEnabled && !token) return setError('Just a moment while we check your browser.')

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/subscribers/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { [TURNSTILE_HEADER]: token } : {}),
        },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setEmail('')
      setDone(true)
    } catch {
      setError('Something went wrong just then. Please try again in a moment.')
      // that token is spent either way — hand them a fresh challenge
      setToken(null)
      setChallenge((n) => n + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p className="newsletter-done" role="status">
        You&rsquo;re on the list. The next one goes out at the end of the month.
      </p>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={submit} noValidate>
      <div className="newsletter-field">
        <label className="newsletter-label" htmlFor={fieldId}>
          Email address
        </label>
        <input
          id={fieldId}
          className="newsletter-input"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEngaged(true)}
          required
        />
        <button type="submit" className="newsletter-submit" disabled={submitting}>
          {submitting ? 'Joining…' : 'Join'}
          <ArrowRight />
        </button>
      </div>

      {engaged && <Turnstile key={challenge} onToken={onToken} />}

      {error && (
        <p className="newsletter-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
