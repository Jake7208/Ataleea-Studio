'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Check, LinkIcon } from '@/components/icons'

type Props = {
  /**
   * The address to copy. Passed in from the server as the canonical URL rather
   * than read off `window.location`, so a link shared from a page reached with
   * a tracking parameter on it does not carry that parameter to whoever it is
   * shared with.
   */
  url: string
}

/** Long enough to read the word, short enough not to look stuck. */
const REVERT_AFTER = 2000

/**
 * The way this worked before the async clipboard API, and the only way that
 * works without a secure context. Deprecated, still universally implemented,
 * and the alternative is a button that does nothing on those browsers.
 *
 * Off-screen rather than `display: none` or `hidden`, because a field the
 * browser does not render cannot be selected, and selection is what the copy
 * command acts on.
 */
function copyViaSelection(text: string): boolean {
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.setAttribute('aria-hidden', 'true')
  field.style.cssText = 'position:fixed;top:-9999px;opacity:0'
  document.body.append(field)
  field.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field.remove()
  }
}

/**
 * Copies the article's address to the clipboard.
 *
 * Not a share sheet: `navigator.share` is a phone feature that desktop browsers
 * mostly do not have, so it would be a button that works for some readers and
 * silently does nothing for the rest. Copying works everywhere.
 *
 * The button reports what happened rather than assuming. Clipboard writes fail
 * for reasons the page cannot see in advance — a permissions policy, a browser
 * that only exposes the API over HTTPS, a reader who has denied it — so both
 * routes are tried and the button only claims success when something succeeded.
 * One that says "Copied" when nothing was copied is worse than one that admits
 * it: the reader pastes the last thing they actually copied and never finds out
 * why the link is wrong.
 */
export default function CopyLink({ url }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      ok = copyViaSelection(url)
    }

    setState(ok ? 'copied' : 'failed')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), REVERT_AFTER)
  }

  const label = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy link'

  return (
    <button
      type="button"
      className="copy-link"
      data-state={state}
      onClick={copy}
      // The visible label changes under the pointer, so the accessible name has
      // to say what the control does rather than what it currently reads.
      aria-label={`Copy link to this article${state === 'copied' ? ', copied' : ''}`}
    >
      {state === 'copied' ? <Check /> : <LinkIcon />}
      {/* aria-live on the label alone: the button keeps its name from the
          aria-label above, and only the change is announced. */}
      <span className="copy-link-label" aria-live="polite">
        {label}
      </span>
    </button>
  )
}
