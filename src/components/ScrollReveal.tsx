'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Reveals `[data-reveal]` elements as they enter the viewport. The starting
 * (hidden) state is gated on `data-reveal-ready`, which an inline script in the
 * layout sets before first paint — so the content is never hidden unless we
 * know JavaScript is running to bring it back.
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

    for (const el of document.querySelectorAll('[data-reveal]')) observer.observe(el)

    return () => observer.disconnect()
  }, [pathname])

  return null
}
