'use client'

import React, { useEffect, useRef } from 'react'

type Props = {
  src: string
  /** Describes the clip for assistive tech. There are no controls to label. */
  label: string
  className?: string
}

/**
 * A clip that behaves like scenery rather than like a player: silent, looping,
 * no controls, and inert to the pointer.
 *
 * It plays while it is on screen and pauses when it is not, picking up where it
 * left off rather than starting over — a reader scrolling back to something they
 * have already passed is not asking to watch it again from the top.
 *
 * Playback is driven from the observer rather than the `autoplay` attribute,
 * which would run every clip on the page from load whether or not anyone can see
 * it: decoding video off-screen for the whole visit, and spending a laptop
 * battery animating something nobody is looking at.
 */
export default function AmbientVideo({ src, label, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    // Reduced motion gets the still first frame and nothing else. SmoothScroll
    // reads the same query to skip Lenis entirely — a reader who asked for
    // stillness should not have this be the thing that still moves.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Set on the element as well as in JSX. `muted` is the sole reason the
    // browser permits this to play unprompted, and it is worth being certain
    // the property is actually set rather than trusting the attribute to have
    // been reflected before the first play() lands.
    video.muted = true

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // No seek — pause() holds the position, so this resumes rather than
          // restarts. Rejects when a browser blocks playback anyway: low power
          // mode, data saver, a per-site setting. That is a decision to respect,
          // not an error — the frame it stopped on stays up and the page is fine.
          void video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      // Negative margins rather than a threshold, so this behaves the same for
      // a clip taller than the viewport — which never reaches a high threshold
      // and would otherwise sit there never playing.
      { rootMargin: '-12% 0px' },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // Deliberately unwrapped. ImageSlot's contract is that artwork and its
  // placeholder are a single element in the same position, and the case-study
  // widths select on `video` as a child of .cs-media-inner — a wrapper div here
  // would break both, so whoever needs .media-frame supplies it.
  return (
    <video
      ref={ref}
      className={className ? `ambient-video ${className}` : 'ambient-video'}
      src={src}
      muted
      loop
      playsInline
      // Enough to paint the first frame without pulling the whole clip down for
      // a reader who never scrolls this far.
      preload="metadata"
      aria-label={label}
    />
  )
}
