'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function ScrollPathLine() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  
  const [pathData, setPathData] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  // Cache values to prevent layout thrashing on scroll
  const rectsRef = useRef<Array<{ left: number; top: number; width: number; height: number }>>([])
  const containerDocTopRef = useRef(0)
  const containerWidthRef = useRef(0)

  // 1. Calculate the dynamic SVG path based on parent container size
  useEffect(() => {
    const parent = containerRef.current?.parentElement
    const container = parent?.querySelector('.hero-index') as HTMLElement
    if (!container) return

    const updatePath = () => {
      const numElements = container.querySelectorAll('.num')
      const rects = Array.from(numElements).map((el) => {
        const r = el.getBoundingClientRect()
        const parentRect = container.getBoundingClientRect()
        return {
          left: r.left - parentRect.left,
          top: r.top - parentRect.top,
          width: r.width,
          height: r.height,
        }
      })

      // If we don't have exactly 3 items, don't show the path
      if (rects.length < 3) {
        setIsVisible(false)
        rectsRef.current = []
        return
      }

      const W = container.clientWidth

      // Check if layout is vertical (collapsed on mobile/tablet)
      const isVertical = rects[1].top > rects[0].top + 10

      if (isVertical) {
        // Hide the SVG drawing line on vertical stacked layouts (mobile)
        setIsVisible(false)
        rectsRef.current = []
        return
      }

      setIsVisible(true)
      rectsRef.current = rects
      
      const parentRect = container.getBoundingClientRect()
      containerDocTopRef.current = parentRect.top + window.scrollY
      containerWidthRef.current = W

      // Desktop layout: a perfectly straight horizontal hairline rule replacing the top border
      const y_line = 0
      const bgPath = `M 0,${y_line} L ${W},${y_line}`
      setPathData(bgPath)
    }

    // Trigger initial calculation
    updatePath()

    // Observe the container size changes
    const resizeObserver = new ResizeObserver(updatePath)
    resizeObserver.observe(container)

    // Observe individual number elements
    const numElements = container.querySelectorAll('.num')
    numElements.forEach((el) => {
      resizeObserver.observe(el)
    })

    // Listen to load events to catch any late shifts
    window.addEventListener('load', updatePath)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('load', updatePath)
    }
  }, [])

  // Set initial strokeDasharray and strokeDashoffset once pathData changes
  useEffect(() => {
    const pathEl = pathRef.current
    if (!pathEl || !pathData) return
    try {
      const length = pathEl.getTotalLength()
      pathEl.style.strokeDasharray = `${length} ${length}`
      pathEl.style.strokeDashoffset = `${length}`
    } catch (_) {}
  }, [pathData])

  // 2. Track scroll position to update drawing progress (Direct DOM updates)
  useEffect(() => {
    const parent = containerRef.current?.parentElement
    const container = parent?.querySelector('.hero-index') as HTMLElement
    if (!container) return

    let frameId: number

    const handleScroll = () => {
      if (rectsRef.current.length < 3) return

      const currentScroll = window.scrollY
      const viewportHeight = window.innerHeight
      
      const docTop = containerDocTopRef.current
      const W = containerWidthRef.current
      const containerTop = docTop - currentScroll

      // Start drawing when the section's top is 95% down the viewport
      // Complete drawing when the section's top reaches 40% of viewport height
      const startY = viewportHeight * 0.95
      const endY = viewportHeight * 0.40

      let prog = (startY - containerTop) / (startY - endY)
      prog = Math.max(0, Math.min(1, prog))

      // Direct DOM update of SVG path offset for buttery-smooth performance
      const pathEl = pathRef.current
      if (pathEl) {
        try {
          const length = pathEl.getTotalLength()
          pathEl.style.strokeDashoffset = `${length * (1 - prog)}`
        } catch (_) {}
      }

      // Direct DOM update of card visibility triggers
      const items = container.querySelectorAll('.hero-index-item')
      rectsRef.current.forEach((r, idx) => {
        const itemEl = items[idx]
        if (!itemEl) return

        // Trigger threshold: as soon as the drawing line passes the left edge of the column
        const threshold = r.left / W

        if (prog >= threshold) {
          itemEl.classList.add('is-revealed-via-scroll')
        } else {
          itemEl.classList.remove('is-revealed-via-scroll')
        }
      })
    }

    const onScroll = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Trigger initial paint frame

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frameId)
    }
  }, [isVisible])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: isVisible && pathData ? 'block' : 'none',
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )}
        {pathData && (
          <path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.25"
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        )}
      </svg>
    </div>
  )
}
