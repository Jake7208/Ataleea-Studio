'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Reveals `[data-reveal]` elements as they enter the viewport. The starting
 * (hidden) state is gated on `data-reveal-ready`, which an inline script in the
 * layout sets before first paint — so the content is never hidden unless we
 * know JavaScript is running to bring it back.
 *
 * The elements already on screen at first load are not this component's
 * business. Left to the observer they all intersect on the same frame and land
 * together, which is a pop rather than an entrance — so they get a staggered
 * cascade instead, and that cascade runs from the inline script in the layout
 * (INTRO_INIT), not from here. It has to: anything this component does waits on
 * hydration, and the hero cannot be held at opacity 0 that long. What arrives
 * here is the aftermath — those elements are already marked `data-intro`, and
 * are skipped below so the observer doesn't overtake their stagger.
 *
 * Route changes deliberately keep the plain behaviour: nothing is marked
 * `is-intro` on a fresh page, so everything on screen reveals at once inside
 * PageTransition's crossfade. Running a cascade inside a fade reads as two
 * competing animations rather than one.
 *
 * The sweep below runs again for anything added after mount, which is not a
 * refinement — it is what makes the system safe to use from a client component
 * at all. Elements start at opacity 0 and it is the observer that brings them
 * back, so a `[data-reveal]` element that appeared without being enrolled is
 * not "un-animated", it is invisible, permanently. Enrolling once per route
 * quietly made `[data-reveal]` unusable in anything that renders on demand —
 * the newsroom's filter had to keep every card mounted and merely hidden to
 * work around it.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    if (document.documentElement.hasAttribute('data-reveal-off')) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    const enrol = (root: ParentNode) => {
      for (const el of root.querySelectorAll('[data-reveal]:not([data-intro])')) {
        observer.observe(el)
      }
    }

    enrol(document)

    // Re-observing an element the observer already holds is a no-op, and one it
    // has already revealed was unobserved above — so the only cost of a broad
    // sweep is the query itself, and subtree mutations are rare enough on this
    // site that a narrower one would be bookkeeping for nothing.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue
          if (node.matches('[data-reveal]:not([data-intro])')) observer.observe(node)
          enrol(node)
        }
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
    }
  }, [pathname])

  return null
}
