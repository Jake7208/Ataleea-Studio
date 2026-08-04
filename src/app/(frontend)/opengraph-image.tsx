import { ImageResponse } from 'next/og'

import { siteConfig } from '@/site.config'

// Applies to every route in this group unless a page ships its own.
export const alt = `${siteConfig.name} — websites for construction companies and the trades`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Forest ground with off-white ink, the same pairing the dark panels use on the
// site. Satori supports a subset of CSS — flex only, no gap, every container
// needs an explicit display — so this is laid out with margins rather than the
// stylesheet's idiom.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f2d2b',
          color: '#f1f0e9',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(241, 240, 233, 0.6)',
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              maxWidth: 900,
            }}
          >
            Digital presence for people who build things.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* hairline, matching the rules the site is built on */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 1,
              backgroundColor: 'rgba(241, 240, 233, 0.24)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: 'rgba(241, 240, 233, 0.72)',
              maxWidth: 820,
            }}
          >
            Websites and local search for construction companies and the trades around them.
          </div>
        </div>
      </div>
    ),
    size,
  )
}
