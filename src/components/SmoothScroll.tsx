'use client'

// Type-only, so the import is erased at build time and the library itself is
// pulled in lazily inside the effect below — see the note there.
import type Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Keeps anchored sections clear of the sticky header. Read from the stylesheet's
// own scroll-padding-top (--header-h plus a little air) rather than hardcoded,
// so anchors we scroll ourselves land exactly where the ones the browser
// handles do, and neither drifts if the header height changes.
const FALLBACK_OFFSET = 74

const anchorOffset = () => {
  const declared = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  return Number.isFinite(declared) ? declared : FALLBACK_OFFSET
}

/**
 * Lenis smooth scrolling. Skipped entirely for readers who ask for reduced
 * motion, in which case the browser's native scrolling is left alone.
 *
 * Also owns where each new route starts. Lenis holds the scroll position and
 * html.lenis forces scroll-behavior:auto, so neither the browser's own hash
 * handling nor the router's scroll restoration gets a say once it is mounted —
 * this has to place them.
 */
export default function SmoothScroll() {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)
  const isFirstRoute = useRef(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let frame = 0

    // Loaded on demand rather than imported at the top. Lenis is ~32KB of the
    // app's client bundle and nothing needs it until after hydration, so this
    // keeps it out of the initial chunk — and readers on reduced motion, who
    // returned above, never fetch it at all.
    void (async () => {
      const { default: LenisCtor } = await import('lenis')
      if (disposed) return

      const lenis = new LenisCtor({
        // 0.7 rather than 1. A full second of glide reads as the page lagging
        // behind the wheel: you stop scrolling and it keeps going, which is the
        // thing people mean when they call smooth scrolling floaty.
        duration: 0.7,
        // easeOutQuint, matching the --ease curve the CSS transitions now use.
        // Steeper than the cubic it replaces, so most of the distance is covered
        // early and the tail is short: it arrives fast and settles rather than
        // drifting in.
        easing: (t: number) => 1 - Math.pow(1 - t, 5),
      })
      lenisRef.current = lenis

      frame = requestAnimationFrame(function raf(time: number) {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      })

      // whatever the class list did while the library was in flight
      syncLock()
    })()

    // Lenis owns the scroll position, so in-page anchors have to go through it.
    // Capture phase, and for the same reason PageTransition uses it: <Link>
    // preventDefaults from a React handler delegated to the root container, so
    // a bubble listener here would find every anchor already defaultPrevented
    // and hand it to the router, which jumps instead of animating. Getting in
    // first and preventing it ourselves makes <Link> stand down.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname !== window.location.pathname) return
      if (!url.hash || url.hash === '#') return

      const target = document.querySelector(url.hash)
      if (!target) return

      // Not loaded yet — leave the event alone so the browser does its own hash
      // scroll. html.lenis isn't set either, so scroll-behavior:smooth still
      // applies and it animates.
      const lenis = lenisRef.current
      if (!lenis) return

      event.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -anchorOffset() })
      window.history.pushState(null, '', url.hash)
    }

    document.addEventListener('click', onClick, true)

    // the slide panel locks the page by class; Lenis has to be told, or it
    // keeps scrolling the page behind it
    function syncLock() {
      const lenis = lenisRef.current
      if (!lenis) return
      if (document.documentElement.classList.contains('is-scroll-locked')) lenis.stop()
      else lenis.start()
    }

    const lockObserver = new MutationObserver(syncLock)
    lockObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick, true)
      lockObserver.disconnect()
      lenisRef.current?.destroy()
      lenisRef.current = null
    }
  }, [])

  // Where each new route starts.
  //
  // A scroll still in flight when the link was clicked does not belong to this
  // page, but Lenis has no idea a navigation happened — left alone it keeps
  // easing towards wherever the previous page was heading and carries the new
  // one past its anchor. So every route change ends in an explicit, forced
  // placement, which doubles as the cancel.
  //
  // The destination is an absolute pixel value read off the live rect rather
  // than Lenis's own scrollTo(element): its element maths resolves against
  // measurements the navigation just invalidated, and going through the rect
  // is also indifferent to whether the router has already run its own hash
  // scroll this frame.
  //
  // Instant, never animated — PageTransition holds the page at zero opacity
  // across this commit, so the move is invisible and the content fades up
  // already in place.
  useEffect(() => {
    // a fresh load keeps whatever position the browser restored or hashed to
    if (isFirstRoute.current) {
      isFirstRoute.current = false
      return
    }

    // one frame of headroom so the new route has laid out before it's measured
    const raf = requestAnimationFrame(() => {
      const lenis = lenisRef.current
      // the document just changed shape underneath it
      lenis?.resize()

      const { hash } = window.location
      const target = hash && hash !== '#' ? document.querySelector(hash) : null
      const top =
        target instanceof HTMLElement
          ? Math.max(0, target.getBoundingClientRect().top + window.scrollY - anchorOffset())
          : 0

      // force: land it even if an overlay has Lenis stopped
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
      else window.scrollTo(0, top)
    })

    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return null
}
