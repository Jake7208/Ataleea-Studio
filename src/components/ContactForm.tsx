'use client'

import React, { useId, useState } from 'react'

import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact-topics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DEFAULT_TOPIC: ContactTopic = 'project'

export default function ContactForm({ initialTopic }: { initialTopic?: ContactTopic }) {
  const groupName = useId()
  const empty = {
    name: '',
    company: '',
    email: '',
    topic: (initialTopic ?? DEFAULT_TOPIC) as ContactTopic,
    message: '',
  }

  const [values, setValues] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const set =
    (key: 'name' | 'company' | 'email' | 'message') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (values.name.trim().length < 2) return setError('Please enter your name.')
    if (!EMAIL_RE.test(values.email.trim())) return setError('Please enter a valid email address.')
    if (values.message.trim().length < 5) return setError('Please add a line or two about the project.')

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.company ? `${values.name.trim()} (${values.company.trim()})` : values.name.trim(),
          email: values.email.trim(),
          topic: values.topic,
          message: values.message.trim(),
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setValues(empty)
      setSent(true)
    } catch {
      setError('Something went wrong sending your message — please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="form-done">
        <h3>Thanks — your message is in.</h3>
        <p>We read everything that comes through and will reply within a day.</p>
        <button type="button" className="btn btn-outline" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor={`${groupName}-name`}>
            Name
          </label>
          <input
            id={`${groupName}-name`}
            className="form-input"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor={`${groupName}-company`}>
            Company
          </label>
          <input
            id={`${groupName}-company`}
            className="form-input"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={set('company')}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`${groupName}-email`}>
          Email
        </label>
        <input
          id={`${groupName}-email`}
          className="form-input"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          required
        />
      </div>

      {/* radios rather than a select — the options are worth seeing at a glance */}
      <fieldset className="form-group choice-group">
        <legend className="form-label">Enquiry</legend>
        <div className="choice-row">
          {CONTACT_TOPICS.map(({ value, label }) => (
            <label key={value} className="choice">
              <input
                type="radio"
                name={`${groupName}-topic`}
                value={value}
                checked={values.topic === value}
                onChange={() => setValues((v) => ({ ...v, topic: value }))}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-group">
        <label className="form-label" htmlFor={`${groupName}-message`}>
          Project
        </label>
        <textarea
          id={`${groupName}-message`}
          className="form-textarea"
          rows={4}
          value={values.message}
          onChange={set('message')}
          required
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-solid" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}
