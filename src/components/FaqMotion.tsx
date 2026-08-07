'use client'

import { useEffect } from 'react'

/** A little longer than --dur-md. A panel changing size needs more time to read
 *  as movement than a thing changing colour does. */
const DUR_MS = 420

/**
 * Easing curve for a smooth accordion feel.
 * Starts fast and lands slow, matching high-end motion standards.
 */
const PANEL_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)'
const CONTENT_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)'

/** How far the answer travels inside the panel as it opens. Small on purpose:
 *  enough that the text reads as arriving rather than as being wiped in by the
 *  clip edge, not so far that it races the panel it is inside. */
const CONTENT_SHIFT = 10

/**
 * Extracts the current translateY value from the element's computed transform matrix.
 */
const getTranslateY = (el: HTMLElement): number => {
  const style = window.getComputedStyle(el)
  const transform = style.transform
  if (transform === 'none') return 0
  const matrix = transform.match(/^matrix\((.+)\)$/)
  if (matrix) {
    const values = matrix[1].split(', ')
    if (values.length === 6) {
      return parseFloat(values[5])
    }
  }
  return 0
}

/**
 * Extracts the current computed opacity from the element.
 */
const getOpacity = (el: HTMLElement): number => {
  const style = window.getComputedStyle(el)
  const opacity = parseFloat(style.opacity)
  return isNaN(opacity) ? 1 : opacity
}

/**
 * Animates the FAQ panels open and closed.
 *
 * A behaviour-only island, in the same shape as ScrollReveal and SmoothScroll:
 * the markup stays server-rendered native <details>, so the answers are in the
 * DOM for crawlers and the accordion still works with JavaScript off. This only
 * upgrades the motion.
 *
 * It intercepts clicks and animates the panel height using the Web Animations API.
 * Interrupted animations (clicks mid-flight) are handled seamlessly by measuring the
 * computed height, opacity, and transform and starting the new animation from those
 * exact values.
 */
export default function FaqMotion() {
  useEffect(() => {
    if (document.documentElement.hasAttribute('data-reveal-off')) return

    const list = document.querySelector<HTMLElement>('.faq-list')
    if (!list) return

    // tells the stylesheet to drop its own open keyframe
    list.setAttribute('data-faq-motion', '')

    const cleanups: Array<() => void> = []

    for (const item of list.querySelectorAll<HTMLDetailsElement>('.faq-item')) {
      const summary = item.querySelector('summary')
      const panel = item.querySelector<HTMLElement>('.faq-answer')
      const content = panel?.firstElementChild as HTMLElement
      if (!summary || !panel || !content) continue

      let anim: Animation | null = null
      let fade: Animation | null = null
      let opening = false

      const settle = () => {
        panel.style.height = ''
        panel.style.overflow = ''
        anim = null
        fade = null
      }

      // Covers the keyboard too: Enter and Space on a <summary> dispatch a
      // click, so there is no separate keydown path to write.
      const onClick = (event: MouseEvent) => {
        event.preventDefault()

        // Read where the panel is right now BEFORE cancelling the current animations
        const currentHeight = anim || item.open ? panel.getBoundingClientRect().height : 0
        const currentOpacity = getOpacity(content)
        const currentY = getTranslateY(content)

        const shouldOpen = anim ? !opening : !item.open

        anim?.cancel()
        fade?.cancel()
        panel.style.overflow = 'hidden'
        opening = shouldOpen

        if (shouldOpen) {
          item.removeAttribute('data-closing')
          item.open = true

          // Clear inline height to measure the natural full scrollHeight of the panel
          panel.style.height = ''
          const targetHeight = panel.scrollHeight

          anim = panel.animate(
            { height: [`${currentHeight}px`, `${targetHeight}px`] },
            { duration: DUR_MS, easing: PANEL_EASE },
          )
          fade = content.animate(
            {
              opacity: [currentOpacity, 1],
              transform: [`translateY(${currentY}px)`, 'none'],
            },
            { duration: DUR_MS, easing: CONTENT_EASE },
          )
          anim.onfinish = settle
        } else {
          item.setAttribute('data-closing', '')

          anim = panel.animate(
            { height: [`${currentHeight}px`, '0px'] },
            { duration: DUR_MS, easing: PANEL_EASE },
          )
          fade = content.animate(
            {
              opacity: [currentOpacity, 0],
              transform: [`translateY(${currentY}px)`, `translateY(-${CONTENT_SHIFT}px)`],
            },
            {
              duration: Math.round(DUR_MS * 0.7),
              easing: CONTENT_EASE,
              fill: 'forwards',
            },
          )
          anim.onfinish = () => {
            item.open = false
            item.removeAttribute('data-closing')
            fade?.cancel()
            settle()
          }
        }
      }

      summary.addEventListener('click', onClick)
      cleanups.push(() => {
        summary.removeEventListener('click', onClick)
        anim?.cancel()
        fade?.cancel()
        item.removeAttribute('data-closing')
        settle()
      })
    }

    return () => {
      for (const undo of cleanups) undo()
      list.removeAttribute('data-faq-motion')
    }
  }, [])

  return null
}
