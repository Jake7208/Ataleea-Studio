'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Contrast } from '@/components/icons'

type Theme = 'light' | 'dark'

/**
 * Flips the scheme by stamping `data-theme` on <html>; the stylesheet does the
 * rest. Until someone clicks, no attribute is set and the OS keeps deciding —
 * so a visitor who never touches this still gets the scheme they asked their
 * machine for, and it keeps working with JavaScript off.
 *
 * The icon's own appearance is CSS, keyed to the scheme rather than to the
 * state below, so it is right in the first painted frame instead of correcting
 * itself after hydration. The state here is only for the label.
 */
export default function ThemeToggle() {
  // null until mounted: the server can't know the scheme, and rendering a
  // guess would mean a wrong label on the first frame
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    // Backstop for the notFound() path: Next aborts the server render there, so
    // the layout's inline theme script is created by React on the client — where
    // scripts are inert by design and never run. Without this, a visitor who
    // picked against their OS would get the OS scheme on every 404. A no-op on
    // every other route, where the inline script has already set the attribute.
    if (!root.hasAttribute('data-theme')) {
      try {
        const saved = localStorage.getItem('theme')
        if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved)
      } catch {
        // storage blocked — fall through to the OS preference, as elsewhere
      }
    }

    const resolve = () => {
      const chosen = root.getAttribute('data-theme')
      setTheme(chosen === 'light' || chosen === 'dark' ? chosen : mq.matches ? 'dark' : 'light')
    }

    resolve()
    // only bites while there's no explicit choice — once one exists resolve()
    // reads the attribute first, so an OS flip can't overrule the visitor
    mq.addEventListener('change', resolve)
    return () => mq.removeEventListener('change', resolve)
  }, [])

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('theme', next)
      } catch {
        // storage blocked (private mode, cookie settings) — the choice simply
        // won't outlive the page, which beats not switching at all
      }
      return next
    })
  }, [])

  const label =
    theme === null
      ? 'Switch between the light and dark theme'
      : `Switch to the ${theme === 'dark' ? 'light' : 'dark'} theme`

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <Contrast />
    </button>
  )
}
