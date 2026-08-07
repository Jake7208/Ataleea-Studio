import ImageSlot from './ImageSlot'
import HeroShader from './HeroShader'
import type { Media } from '@/payload-types'

type HeroBannerProps = {
  /** Omit to render the field on its own, with nothing floating on it. */
  media?: string | Partial<Media> | null | undefined
  /**
   * `hero` is the inset, rounded, full-height opening banner with media on it.
   * `band` is the edge-to-edge atmosphere strip: square corners, no media, and
   * sized from the --media-h the .band section sets.
   */
  variant?: 'hero' | 'band'
  /**
   * Seconds to advance the field before the first frame. Two instances left on
   * the same seed and booted at the same moment would draw the same picture, so
   * the band offsets itself well away from the hero.
   */
  seed?: number
  /**
   * One short statement, centred on the field.
   *
   * For the band, which is the only block on the page with no grid and no
   * column to sit in and is therefore the one place a single line can be the
   * whole composition. Keep it to a sentence or two: `.hero-banner-line` caps
   * the measure deliberately, and anything longer stops being a statement and
   * starts being a paragraph that happens to be centred.
   */
  children?: React.ReactNode
}

/**
 * The generated field, optionally with media floating on it.
 *
 * The field is its own client component so this one can stay a server
 * component: the banner is the largest thing above the fold, and there is no
 * reason for the image inside it to wait on the shader's bundle. If WebGL is
 * unavailable the canvas draws nothing and the CSS fallback on .hero-banner is
 * what shows, which is why that fallback is a finished background rather than a
 * flat colour.
 *
 * Two of these on one page means two WebGL contexts, which is well inside every
 * browser's limit and costs less than it sounds: each one stops its loop when it
 * scrolls out of view, and they are far enough apart that only one is ever on
 * screen. See the IntersectionObserver in HeroShader.
 */
export default function HeroBanner({ media, variant = 'hero', seed, children }: HeroBannerProps) {
  return (
    <div className={variant === 'band' ? 'hero-banner hero-banner-band' : 'hero-banner'}>
      <HeroShader seed={seed} />
      {children && <div className="hero-banner-line">{children}</div>}
      {media !== undefined && (
        <div className="hero-banner-content">
          <ImageSlot
            label="Hero, lead project"
            spec="One finished site on screen. A device mockup or a full-width frame of the design itself, centred."
            media={media}
            loading="eager"
            // The one image on the site that gets this. It is the largest thing
            // above the fold on the home page, which makes it the LCP element,
            // and left at the default it queues behind every script on the page.
            fetchPriority="high"
            // Mirrors .hero-banner-content: 82% of the wide container, capped at
            // 1100px, 90% below the mobile breakpoint. 82vw hits that cap at a
            // 1340px viewport, which is where the last step comes from. This was
            // 100vw, which on a wide retina screen asked for 2× the display
            // width and pulled the 2540px original down for a slot that never
            // renders past 1100.
            sizes="(max-width: 768px) 90vw, (max-width: 1340px) 82vw, 1100px"
          />
        </div>
      )}
    </div>
  )
}
