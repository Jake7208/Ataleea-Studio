/**
 * Ref-counted page scroll lock. Counted rather than a plain toggle because
 * overlays can overlap — a service panel handing off to the contact panel would
 * otherwise unlock the page on the way through.
 *
 * `SmoothScroll` watches for this class and stops Lenis while it is present.
 */
const CLASS = 'is-scroll-locked'

let locks = 0

export function lockScroll() {
  locks += 1
  document.documentElement.classList.add(CLASS)
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) document.documentElement.classList.remove(CLASS)
}
