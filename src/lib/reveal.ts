/**
 * Props that enrol an element in the reveal system. Spread them rather than
 * writing `data-reveal` by hand: the attribute on its own is half of what these
 * elements need.
 *
 * The other half is `suppressHydrationWarning`, which is not decoration here.
 * The first-load cascade runs from an inline script in the layout, before React
 * hydrates — see INTRO_INIT there for why it has to — and it marks whatever is
 * on screen with `data-intro` and `data-shown`. React compares the DOM it is
 * hydrating against the props it rendered and reports anything it did not put
 * there, so without this, every element the cascade touched logs a mismatch on
 * every load. It cannot be applied to just the elements that need it either:
 * which ones the cascade reaches depends on the reader's viewport height, and
 * that is not knowable at author time.
 */
export const reveal = {
  'data-reveal': true,
  suppressHydrationWarning: true,
} as const

/**
 * As `reveal`, but enters on movement alone with no fade.
 *
 * For the single largest element in a page's opening screen — the one that will
 * be its Largest Contentful Paint. A fade from transparent is charged to that
 * metric in full, however early the cascade starts. See the note on
 * [data-reveal='rise'] in styles.css.
 *
 * It has a second effect, which is the reason to reach for it rather than to
 * avoid it: a page that carries one is a page where the rest of the entry
 * cascade can keep its fade, because the metric is already spoken for by an
 * element that never fades. Without one, the whole opening screen has to light
 * at once instead. So use it on the one element it describes, and use it
 * accurately — claiming it for something that is not the largest thing above
 * the fold hands the fade to the cascade and the metric to whatever actually is.
 */
export const revealRise = {
  'data-reveal': 'rise',
  suppressHydrationWarning: true,
} as const
