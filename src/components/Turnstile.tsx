'use client'

import React, { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Whether the widget will render at all. Forms read this to decide if a token
 * is required before they'll submit — without a site key there is nothing to
 * solve, and the server-side check stands down to match.
 */
export const turnstileEnabled = Boolean(SITE_KEY)

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
      theme?: 'auto' | 'light' | 'dark'
    },
  ) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// one script for the page however many widgets ask for it
let scriptPromise: Promise<void> | null = null

const loadScript = () => {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = SCRIPT_SRC
    el.async = true
    el.defer = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('Turnstile script failed to load'))
    document.head.appendChild(el)
  })
  return scriptPromise
}

/**
 * Renders the Turnstile challenge and hands its token up. Tokens are single
 * use, so a form that fails mid-submit has to remount this (change its `key`)
 * to get a fresh one.
 */
export default function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const holder = useRef<HTMLDivElement>(null)
  // kept in a ref so an inline callback from the parent doesn't retrigger the
  // effect below and render a second widget
  const report = useRef(onToken)

  useEffect(() => {
    report.current = onToken
  }, [onToken])

  useEffect(() => {
    if (!SITE_KEY) return

    let cancelled = false
    let widgetId: string | null = null

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return
        widgetId = window.turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          callback: (token) => report.current(token),
          'expired-callback': () => report.current(null),
          'error-callback': () => report.current(null),
          theme: 'auto',
        })
      })
      .catch(() => {
        // Cloudflare unreachable or blocked. Leave the form usable and let the
        // server decide — it will reject the tokenless submission with a
        // message, rather than the form silently refusing to do anything.
        report.current(null)
      })

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [])

  if (!SITE_KEY) return null
  return <div className="turnstile" ref={holder} />
}
