'use client'

import React, { useState } from 'react'

type Topic = 'work' | 'question' | 'hello'

// values must match the `topic` select options in collections/ContactSubmissions.ts
const TOPICS: { value: Topic; label: string }[] = [
  { value: 'work', label: 'Work together' },
  { value: 'question', label: 'A question' },
  { value: 'hello', label: 'Just saying hi' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { name: '', email: '', topic: '' as Topic | '', message: '' }

/** Plain contact form — posts straight to Payload's REST API. */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (values.name.trim().length < 2) return setError('Please enter your name.')
    if (!EMAIL_RE.test(values.email.trim())) return setError('That email doesn’t look right yet.')
    if (values.message.trim().length < 5) return setError('Please write a short message.')

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          topic: values.topic || undefined,
          message: values.message.trim(),
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setValues(EMPTY)
      setSent(true)
    } catch {
      setError('Something went wrong sending that — try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="contact-form contact-form-done">
        <p>Thanks — your message is on its way.</p>
        <button type="button" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <label className="contact-field">
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

      <label className="contact-field">
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

      <label className="contact-field">
        <span>Topic</span>
        <select value={values.topic} onChange={set('topic')}>
          <option value="">Pick one (optional)</option>
          {TOPICS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="contact-field">
        <span>Message</span>
        <textarea
          rows={5}
          placeholder="Write it here…"
          value={values.message}
          onChange={set('message')}
          required
        />
      </label>

      {error && <p className="contact-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
