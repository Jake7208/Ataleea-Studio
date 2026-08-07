'use client'

import React, { useEffect, useRef } from 'react'

export default function FooterWordmark() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed')
        } else {
          el.classList.remove('is-revealed')
        }
      },
      {
        threshold: 0.05,
        // Small rootMargin ensures it triggers slightly before entering the visible area
        rootMargin: '0px 0px -5% 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="footer-wordmark" aria-hidden="true">
      {"ATALEEA".split('').map((char, index) => (
        <span key={index} style={{ '--char-index': index } as React.CSSProperties}>
          {char}
        </span>
      ))}
    </div>
  )
}
