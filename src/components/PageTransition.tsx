'use client'

import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

/**
 * Fade between routes. Kept in sync with the .page-transition rule in
 * styles.css — the timeout has to outlast the CSS transition or the route
 * swaps while the old page is still visible.
 */
const EXIT_MS = 220

/**
 * Crossfades <main> across client-side navigations.
 *
 * App Router hands us the new tree already rendered, so there is no "old page"
 * left to animate out by the time `pathname` changes. Getting an exit at all
 * means catching the click first: fade out, then push. That's the same
 * document-level interception SmoothScroll already does for anchors, and the
 * two are deliberately disjoint — this one ignores anything landing on the
 * current pathname, which is exactly what SmoothScroll claims.
 *
 * It listens on the capture phase because <Link> calls preventDefault() from a
 * React handler delegated to the root container. A bubble listener would see
 * every internal link already defaultPrevented and skip it. Running first lets
 * us prevent the event ourselves, which <Link> honours by standing down — so
 * the navigation becomes ours to time. Deliberately no stopPropagation: other
 * click handlers on the link still need to fire, notably the one that closes
 * the mobile nav.
 *
 * The fade doubles as cover for the scroll jump. SmoothScroll repositions on
 * the same commit, so a deep link like /services#local-search lands on its
 * section while the page is still at zero opacity, and fades up in place
 * rather than visibly leaping down the document.
 *
 * Readers who ask for reduced motion never reach the interception at all —
 * links navigate immediately, with no added latency.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const timer = useRef<number | null>(null)
  const pendingHash = useRef<string | null>(null)

  // The new route is committed — drop the exit state and let it fade back up.
  // Also covers Back/Forward, which skip the exit but still need clearing in
  // case a navigation was mid-flight.
  //
  // The gap this leaves for SmoothScroll to place the route before anything is
  // visible is held in CSS, by the transition-delay on .page-transition, rather
  // than by delaying this — a frame's grace here isn't enough against ease-out,
  // and it would depend on the two components' rAF callbacks staying in order.
  //
  // Putting the fragment back also happens here, synchronously, so it is on the
  // URL before SmoothScroll's rAF reads it to decide where to land.
  useEffect(() => {
    if (pendingHash.current) {
      const { pathname: p, search } = window.location
      window.history.replaceState(null, '', `${p}${search}${pendingHash.current}`)
      pendingHash.current = null
    }

    document.documentElement.removeAttribute('data-nav')
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    // Reduced motion still goes through here — the fragment handling below is a
    // correctness fix, not decoration — it just skips the fade and the wait.
    const reduced = root.hasAttribute('data-reveal-off')

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // staying on this page: either a no-op or an in-page anchor, and either
      // way not ours to animate
      if (url.pathname === window.location.pathname) return

      event.preventDefault()

      // The fragment is deliberately withheld from the push and reapplied on
      // arrival. Handing a hash to the router for a path it has already cached
      // under one appends rather than replaces it — /services#project-sites
      // then /services#local-search resolves to a single dead fragment,
      // "project-sites#local-search", matching no element at all. Plain <Link>
      // does this too, so routing around it is the only fix available here.
      pendingHash.current = url.hash && url.hash !== '#' ? url.hash : null
      const go = () => router.push(`${url.pathname}${url.search}`)

      if (reduced) {
        go()
        return
      }

      root.setAttribute('data-nav', 'exiting')
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(go, EXIT_MS)
    }

    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      if (timer.current) window.clearTimeout(timer.current)
      root.removeAttribute('data-nav')
    }
  }, [router])

  return <main className="page-transition">{children}</main>
}
