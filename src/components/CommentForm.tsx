'use client'

import React, { useCallback, useState } from 'react'

import Turnstile, { turnstileEnabled } from '@/components/Turnstile'
import { TURNSTILE_HEADER } from '@/lib/turnstile-header'

export type CommentTarget = 'blog' | 'case-studies'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { name: '', email: '', body: '' }

export default function CommentForm({
  postId,
  postType,
}: {
  postId: string
  postType: CommentTarget
}) {
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  // single-use tokens; remount the widget for a fresh one after a failure
  const [challenge, setChallenge] = useState(0)

  const onToken = useCallback((next: string | null) => setToken(next), [])

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (values.name.trim().length < 2) return setError('Please enter your name.')
    if (!EMAIL_RE.test(values.email.trim())) return setError('That email doesn’t look right yet.')
    if (values.body.trim().length < 2) return setError('Write a comment before sending.')
    if (turnstileEnabled && !token) return setError('Please complete the verification below.')

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { [TURNSTILE_HEADER]: token } : {}),
        },
        body: JSON.stringify({
          post: { relationTo: postType, value: postId },
          name: values.name.trim(),
          email: values.email.trim(),
          body: values.body.trim(),
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setValues(EMPTY)
      setSent(true)
    } catch {
      setError('Something went wrong posting that. Try again in a moment.')
      setToken(null)
      setChallenge((n) => n + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="comment-form comment-form-done">
        <p>Thanks, your comment is awaiting review. It&rsquo;ll show up here once approved.</p>
        <button type="button" onClick={() => setSent(false)}>
          Leave another
        </button>
      </div>
    )
  }

  return (
    <form className="comment-form" onSubmit={submit} noValidate>
      <h3 className="comment-form-title">Leave a comment</h3>

      <div className="comment-form-row">
        <label className="comment-field">
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={set('name')}
            required
          />
        </label>
        <label className="comment-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={set('email')}
            required
          />
        </label>
      </div>

      <label className="comment-field">
        <span>Comment</span>
        <textarea
          rows={4}
          placeholder="Write it here…"
          value={values.body}
          onChange={set('body')}
          maxLength={2000}
          required
        />
      </label>

      <p className="comment-form-note">
        Your email is never published. Comments appear once approved.
      </p>

      <Turnstile key={challenge} onToken={onToken} />

      {error && <p className="contact-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Post comment'}
      </button>
    </form>
  )
}
