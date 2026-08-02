'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

// keeps anchored sections clear of the sticky header — matches --header-h
const HEADER_OFFSET = 74

/**
 * Lenis smooth scrolling. Skipped entirely for readers who ask for reduced
 * motion, in which case the browser's native scrolling is left alone.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1,
      // easeOutCubic — the same curve the CSS transitions use
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })

    // Lenis owns the scroll position, so in-page anchors have to go through it
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

      event.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -HEADER_OFFSET })
      window.history.pushState(null, '', url.hash)
    }

    document.addEventListener('click', onClick)

    // overlays (lightbox, slide panel) lock the page by class; Lenis has to be
    // told, or it keeps scrolling the page behind them
    const lockObserver = new MutationObserver(() => {
      const { classList } = document.documentElement
      const locked = classList.contains('lightbox-open') || classList.contains('is-scroll-locked')
      if (locked) lenis.stop()
      else lenis.start()
    })
    lockObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick)
      lockObserver.disconnect()
      lenis.destroy()
    }
  }, [])

  return null
}
