'use client'

import React, { useCallback, useId, useState } from 'react'

import Turnstile, { turnstileEnabled } from '@/components/Turnstile'
import { ChevronDown } from '@/components/icons'
import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact-topics'
import { CARE_PLANS, PLAN_LABELS, UNSURE_PLAN_ID, type PlanId } from '@/lib/plans'
import { TURNSTILE_HEADER } from '@/lib/turnstile-header'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DEFAULT_TOPIC: ContactTopic = 'project'

const BUDGET_LABELS: Record<string, string> = {
  'under-5k': 'Under $5k',
  '5k-10k': '$5k – $10k',
  '10k-20k': '$10k – $20k',
  '20k-plus': '$20k+',
}

/**
 * What the message box asks for, per enquiry.
 *
 * The panel's intro says a short note is plenty, which settles how *much* to
 * write but not what about. These say what would actually be useful, and they
 * follow the topic because the useful answer is a different one for a new site
 * than for a care plan.
 *
 * Every field on this form keeps its own visible label, so these and the hints
 * below are the example or the prompt, never the label itself. Text that
 * vanishes the moment someone types is no place to keep the only description
 * of what a field wants.
 */
const MESSAGE_PLACEHOLDERS: Record<ContactTopic, string> = {
  project:
    'What the business does, the work you want more of, and roughly when you’d like to be live.',
  local: 'Where you work, what you do, and whether you already have a Google Business Profile.',
  care: 'What you have now, and what you’d like kept on top of.',
  other: 'Whatever it is. A couple of lines is plenty.',
}

export default function ContactForm({
  initialTopic,
  initialPlan,
}: {
  initialTopic?: ContactTopic
  initialPlan?: PlanId
}) {
  const groupName = useId()
  const topic = (initialTopic ?? DEFAULT_TOPIC) as ContactTopic
  const empty = {
    name: '',
    company: '',
    email: '',
    topic,
    budget: '',
    // only meaningful under the care topic, so ignore a plan handed in
    // alongside any other one
    plan: topic === 'care' ? (initialPlan ?? '') : '',
    message: '',
  }

  const [values, setValues] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  // Turnstile tokens are single use — bumping this remounts the widget for a
  // fresh one after a failed attempt
  const [challenge, setChallenge] = useState(0)
  /**
   * Which plan's detail is expanded, if any. One at a time: the picker sits
   * inside a panel, and three open feature lists push the submit button well
   * below the fold.
   */
  const [openPlan, setOpenPlan] = useState<string | null>(null)

  const onToken = useCallback((next: string | null) => setToken(next), [])

  const set =
    (key: 'name' | 'company' | 'email' | 'message') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (values.name.trim().length < 2) return setError('Please enter your name.')
    if (!EMAIL_RE.test(values.email.trim())) return setError('Please enter a valid email address.')
    if (values.message.trim().length < 5) return setError('Please add a line or two about the project.')
    if (turnstileEnabled && !token) return setError('Please complete the verification below.')

    setSubmitting(true)
    setError(null)
    try {
      // Both of these ride along at the top of the message rather than as
      // fields of their own: the submission collection stores a topic and a
      // message, and the notification email prints the message verbatim.
      const meta: string[] = []
      if (values.budget) meta.push(`[Budget: ${BUDGET_LABELS[values.budget] ?? values.budget}]`)
      if (values.plan) {
        meta.push(
          values.plan === UNSURE_PLAN_ID
            ? '[Plan: not sure yet]'
            : `[Plan: ${PLAN_LABELS[values.plan] ?? values.plan}]`,
        )
      }
      const formattedMessage = meta.length
        ? `${meta.join(' ')}\n\n${values.message.trim()}`
        : values.message.trim()

      const res = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { [TURNSTILE_HEADER]: token } : {}),
        },
        body: JSON.stringify({
          name: values.company ? `${values.name.trim()} (${values.company.trim()})` : values.name.trim(),
          email: values.email.trim(),
          topic: values.topic,
          message: formattedMessage,
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setValues(empty)
      setSent(true)
    } catch {
      setError('Something went wrong sending your message. Please try again in a moment.')
      // that token is spent either way — hand them a fresh challenge
      setToken(null)
      setChallenge((n) => n + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="form-done">
        <h3>Thanks, your message is in.</h3>
        <p>I read everything that comes through and will reply within a day.</p>
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
          {/* Not a sample name. A placeholder sits in --ink-faint, one tier off
              the real value rather than a different kind of thing, so "Maria
              Cruz" in this slot reads as a field somebody already filled in.
              Every hint on this form is phrased so it cannot be mistaken for
              an answer. */}
          <input
            id={`${groupName}-name`}
            className="form-input"
            type="text"
            autoComplete="name"
            placeholder="First and last"
            value={values.name}
            onChange={set('name')}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor={`${groupName}-company`}>
            Company
          </label>
          {/* The one field on the form that isn't required, and nothing else
              says so. The hint is the place to put that, rather than adding a
              second kind of label to the row for one field. */}
          <input
            id={`${groupName}-company`}
            className="form-input"
            type="text"
            autoComplete="organization"
            placeholder="Optional"
            value={values.company}
            onChange={set('company')}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`${groupName}-email`}>
          Email
        </label>
        {/* same example the newsletter field uses, so the two forms on the
            site ask for an address the same way */}
        <input
          id={`${groupName}-email`}
          className="form-input"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
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
                onChange={() =>
                  // clear the follow-up answers the new topic won't ask for, so
                  // a budget picked under "New website" can't ship with a care
                  // plan enquiry
                  setValues((v) => ({
                    ...v,
                    topic: value,
                    budget: value === 'project' || value === 'other' ? v.budget : '',
                    plan: value === 'care' ? v.plan : '',
                  }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Show budget field dynamically if the topic is a website project or other */}
      {(values.topic === 'project' || values.topic === 'other') && (
        <fieldset className="form-group choice-group">
          <legend className="form-label">Est. Budget</legend>
          <div className="choice-row">
            {[
              { value: 'under-5k', label: 'Under $5k' },
              { value: '5k-10k', label: '$5k – $10k' },
              { value: '10k-20k', label: '$10k – $20k' },
              { value: '20k-plus', label: '$20k+' },
            ].map(({ value, label }) => (
              <label key={value} className="choice">
                <input
                  type="radio"
                  name={`${groupName}-budget`}
                  value={value}
                  checked={values.budget === value}
                  onChange={() => setValues((v) => ({ ...v, budget: value }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {values.budget && (
            <p className="form-help-note">
              We design mockups in Figma, then build on a private staging link so you can experience your site live in the browser.
            </p>
          )}
        </fieldset>
      )}

      {/* The plans are priced and described on /#care, but someone who opened
          this panel from a "Enquire" button has left that grid behind — so the
          picker carries the price and the full list of what's included with
          it, rather than sending them back out of the form to go and read. */}
      {values.topic === 'care' && (
        <fieldset className="form-group choice-group">
          <legend className="form-label">Which plan?</legend>

          <div className="plan-choice-list">
            {CARE_PLANS.map((plan) => {
              const expanded = openPlan === plan.id
              return (
                <div key={plan.id} className={`plan-choice ${expanded ? 'is-expanded' : ''}`}>
                  <label className="plan-choice-option">
                    <input
                      type="radio"
                      name={`${groupName}-plan`}
                      value={plan.id}
                      checked={values.plan === plan.id}
                      onChange={() => setValues((v) => ({ ...v, plan: plan.id }))}
                    />
                    <span className="plan-choice-body">
                      <span className="plan-choice-head">
                        <span className="plan-choice-name">{plan.name}</span>
                        <span className="plan-choice-price">
                          {plan.price}
                          <span className="plan-choice-period">{plan.period}</span>
                        </span>
                      </span>
                      <span className="plan-choice-desc">{plan.description}</span>
                    </span>
                  </label>

                  {/* outside the label on purpose: nested in it, opening the
                      detail would also select the plan */}
                  <button
                    type="button"
                    className="plan-choice-toggle"
                    aria-expanded={expanded}
                    aria-controls={`${groupName}-plan-${plan.id}-detail`}
                    onClick={() => setOpenPlan(expanded ? null : plan.id)}
                  >
                    {expanded ? 'Less' : "What's included"}
                    <ChevronDown className="plan-choice-chevron" />
                  </button>

                  {/* Kept in the DOM rather than toggled with `hidden`, which
                      is display:none and has nothing to animate between. The
                      collapse is a 0fr grid row instead, and `inert` does the
                      job `hidden` was doing for tab order and screen readers. */}
                  <div
                    id={`${groupName}-plan-${plan.id}-detail`}
                    className={`plan-choice-detail ${expanded ? 'is-open' : ''}`}
                    inert={!expanded}
                  >
                    <div className="plan-choice-detail-inner">
                      <p className="plan-choice-guidance">{plan.guidance}</p>
                      <ul className="plan-choice-features">
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="plan-choice">
              <label className="plan-choice-option">
                <input
                  type="radio"
                  name={`${groupName}-plan`}
                  value={UNSURE_PLAN_ID}
                  checked={values.plan === UNSURE_PLAN_ID}
                  onChange={() => setValues((v) => ({ ...v, plan: UNSURE_PLAN_ID }))}
                />
                <span className="plan-choice-body">
                  <span className="plan-choice-head">
                    <span className="plan-choice-name">Not sure yet</span>
                  </span>
                  <span className="plan-choice-desc">
                    Tell me what you need below and I&rsquo;ll recommend one.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <p className="form-help-note">Plans are month to month. You can move between them or stop at any time.</p>
        </fieldset>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor={`${groupName}-message`}>
          {values.topic === 'care' ? 'What you need' : 'Project'}
        </label>
        <textarea
          id={`${groupName}-message`}
          className="form-textarea"
          rows={4}
          placeholder={MESSAGE_PLACEHOLDERS[values.topic]}
          value={values.message}
          onChange={set('message')}
          required
        />
      </div>

      <Turnstile key={challenge} onToken={onToken} />

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
