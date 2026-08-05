import React from 'react'

import type { CaseStudy } from '@/payload-types'
import AmbientVideo from '@/components/AmbientVideo'
import Media from '@/components/Media'
import { ArrowRight } from '@/components/icons'
import { deviceFor } from '@/lib/devices'
import { mediaInfo } from '@/lib/media'

type ArticleBodyProps = {
  post: CaseStudy
}

/**
 * A swatch's hex lands in an inline `background` and is editor-supplied, so it
 * is re-checked here rather than trusted from the field validator alone —
 * anything that reaches a style attribute has to be proven safe at the point of
 * use, not at the point of entry. A value that isn't a plain hex is dropped.
 */
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const safeHex = (value?: string | null): string | null => {
  const hex = value?.trim() ?? ''
  return HEX.test(hex) ? hex : null
}

/**
 * Same rule for the live-site link: it lands in an href, so the protocol is
 * pinned here and not merely at entry. Anything that isn't http(s) is dropped,
 * which is what stops a `javascript:` URL — saved before the field validator
 * existed, or written straight to Mongo — from ever becoming a click.
 */
const safeUrl = (value?: string | null): string | null => {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/**
 * `text` blocks were folded into `section`. Mongo keeps whatever was written
 * before that, so a study saved against the old config still has them on disk
 * and they are read here rather than dropping out of a published page. The cast
 * is the point: these no longer exist in the generated types.
 */
type LegacyText = { id?: string | null; description: string }
const legacyText = (block: { blockType: string }): LegacyText | null =>
  block.blockType === 'text' ? (block as unknown as LegacyText) : null

/**
 * One quiet word naming the section — "Typography", "Colour", "Outcome".
 *
 * Deliberately not a badge: no rule, no numeral, no uppercase, no tracking. All
 * of those turn a label into a separate object sitting above the heading, and
 * the point is that it reads as part of the same piece of text. A leading
 * "01 — " from older content is dropped rather than rendered, since the number
 * is exactly the separation this is getting rid of.
 */
const NUMBERED = /^\s*\d{1,2}\s*[—–-]\s*/
const cleanLabel = (value: string) => value.replace(NUMBERED, '').trim()

/**
 * The specimen's character set. Fixed rather than editor-supplied: it is the
 * same every time, and asking someone to type the alphabet into a CMS field is
 * how you end up with a specimen missing its lowercase g.
 */
const ALPHABET = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'
const NUMERALS = '0123456789'

/**
 * One column of the header's fact row: a small label over a hairline, with its
 * values stacked underneath.
 *
 * Grouped rather than one column per field — role/services together, location
 * and year together — because five separate facts make five columns too narrow
 * to read, which is the trap the reference avoids by pairing them up.
 */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cs-fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * Case-study article.
 *
 * Two zones, deliberately. The header splits into a rail — title left, facts
 * right — because a fact list is reference material and wants to sit beside the
 * title rather than under it. Everything below the hero is a single centred
 * column, with full-bleed media and tinted or dark bands between.
 *
 * The bands are the point. A study without them is one unbroken column of cream
 * where every section looks like the one above it, which is what a reader
 * experiences as "no breaks" — so tone is grouped into runs here rather than
 * applied per block, and a heading and the palette it introduces share one
 * panel instead of sitting on two with a seam between.
 */
export default function ArticleBody({ post }: ArticleBodyProps) {
  const hero = mediaInfo(post.mainMedia)
  const liveUrl = safeUrl(post.liveUrl)
  const tags = (post.tags ?? []).filter(
    (t): t is Exclude<typeof t, string> => typeof t !== 'string',
  )
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const customStyle = post.accentColor
    ? ({ '--project-accent': post.accentColor } as React.CSSProperties)
    : undefined

  return (
    <article className="case-study" style={customStyle}>
      <header className="cs-head container">
        <p className="eyebrow">{post.year || published || 'Work'}</p>
        <h1>{post.title}</h1>

        {/* The excerpt already exists as the card teaser and the SEO
            description; here it earns a third use as the intro paragraph,
            rather than asking for the same sentence to be written twice. */}
        {post.excerpt && <p className="cs-intro">{post.excerpt}</p>}

        {liveUrl && (
          <a
            className="link-arrow cs-visit"
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit the site
            <ArrowRight />
          </a>
        )}

        <dl className="cs-facts">
          {post.roles && <Fact label="Role / Services">{post.roles}</Fact>}
          {post.collaborators && post.collaborators.length > 0 && (
            <Fact label="Credits">
              {post.collaborators.map((c) => (
                <span key={c.id ?? `${c.role}-${c.name}`} className="cs-credit">
                  {c.role}: {c.name}
                </span>
              ))}
            </Fact>
          )}
          {(post.location || post.year) && (
            <Fact label="Location & Year">
              {[post.location, post.year].filter(Boolean).join(' — ')}
            </Fact>
          )}
          {tags.length > 0 && (
            <Fact label="Topics">
              <span className="tag-row">
                {tags.map((tag) => (
                  <span className="tag" key={tag.id}>
                    {tag.name}
                  </span>
                ))}
              </span>
            </Fact>
          )}
        </dl>
      </header>

      {hero && (
        <div className="cs-hero container">
          <Media
            src={hero.url}
            srcSet={hero.srcSet}
            sizes="100vw"
            alt={hero.alt || post.title}
            mimeType={hero.mime}
            width={hero.width}
            height={hero.height}
            loading="eager"
            ambient
          />
        </div>
      )}

      <div className="cs-body">
        {groupByTone(post.content ?? []).map((run, i) => {
          const rendered = run.blocks.map((block) => renderBlock(block, post))
          if (!run.tone) return <React.Fragment key={i}>{rendered}</React.Fragment>
          return (
            <div key={i} className={`cs-band cs-band--${run.tone}`}>
              {rendered}
            </div>
          )
        })}
      </div>
    </article>
  )
}

/**
 * The tone a block paints behind itself, or null for one that sits straight on
 * the page. Media is always null: a full-bleed image is its own break and a
 * band behind it would only show as a stripe above and below.
 */
type Tone = 'tinted' | 'dark' | null
const toneOf = (block: { blockType: string; tone?: string | null }): Tone => {
  if (block.blockType !== 'section' && block.blockType !== 'statement') return null
  return block.tone === 'tinted' ? 'tinted' : block.tone === 'dark' ? 'dark' : null
}

/**
 * Blocks that belong to the section introducing them rather than standing on
 * their own. A palette answers the heading above it; so does a specimen, and so
 * does a testimonial. They join whatever band that heading opened instead of
 * declaring a tone, which is what keeps a heading and its evidence on one panel.
 */
const CONTINUES = new Set(['palette', 'typeSpecimen', 'testimonial'])

/**
 * ...unless it carries its own label. A labelled block is introducing itself,
 * so it opens a run rather than joining the one above — otherwise a specimen
 * that names itself still gets swallowed by the previous section's panel.
 */
const isContinuation = (block: { blockType: string; label?: string | null }) =>
  CONTINUES.has(block.blockType) && !block.label

/**
 * Consecutive blocks sharing a tone become one band rather than several.
 * Without this a heading and the palette it introduces sit on two panels with a
 * seam of page colour between them, which reads as a mistake rather than as a
 * pair of sections.
 */
function groupByTone<T extends { blockType: string; tone?: string | null; label?: string | null }>(
  blocks: T[],
) {
  const runs: { tone: Tone; blocks: T[] }[] = []
  for (const block of blocks) {
    const last = runs[runs.length - 1]
    if (last && isContinuation(block)) {
      last.blocks.push(block)
      continue
    }
    const tone = toneOf(block)
    if (last && tone && last.tone === tone) last.blocks.push(block)
    else runs.push({ tone, blocks: [block] })
  }
  return runs
}

/**
 * The page's structural unit: title in the left column, everything else in the
 * right. Blocks with no title still take the row, so their content keeps the
 * same left edge as the sections around them — that shared edge is what a run
 * of sections reads down, and it disappears the moment a block centres itself
 * independently.
 */
function Row({
  label,
  title,
  children,
}: {
  label?: string | null
  title?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="container">
      <div className="cs-row">
        {label && <p className="cs-label">{label}</p>}
        <div className="cs-row-title">{title}</div>
        <div className="cs-row-body">{children}</div>
      </div>
    </div>
  )
}

/** Renders one block's own content. The band around it, if any, is the caller's. */
function renderBlock(block: NonNullable<CaseStudy['content']>[number], post: CaseStudy) {
  const legacy = legacyText(block)
  if (legacy) {
    return (
      <Row key={legacy.id ?? legacy.description.slice(0, 24)}>
        <p className="cs-body-text">{legacy.description}</p>
      </Row>
    )
  }

  if (block.blockType === 'statement') {
    return (
      <div key={block.id ?? block.text.slice(0, 24)} className="container">
        <div className="cs-statement-wrapper">
          <p className="cs-statement">{block.text}</p>
        </div>
      </div>
    )
  }

  if (block.blockType === 'section') {
    const key = block.id ?? block.heading ?? block.body.slice(0, 24)
    const aside = mediaInfo(block.media)

    return (
      <Row
        key={key}
        label={block.eyebrow ? cleanLabel(block.eyebrow) : null}
        title={block.heading ? <h2 className="cs-section-heading">{block.heading}</h2> : null}
      >
        {block.body.split(/\r?\n\r?\n/).filter(Boolean).map((para, i) => (
          <p
            key={i}
            className={block.heading && i === 0 ? 'cs-body-text cs-body-text--lead' : 'cs-body-text'}
          >
            {para}
          </p>
        ))}
        {aside && (
          <div className="cs-row-media">
            <Media
              src={aside.url}
              srcSet={aside.srcSet}
              sizes="(max-width: 900px) 100vw, 55vw"
              alt={aside.alt || block.heading || post.title}
              mimeType={aside.mime}
              width={aside.width}
              height={aside.height}
            />
          </div>
        )}
      </Row>
    )
  }

  if (block.blockType === 'testimonial') {
    const face = mediaInfo(block.photo)
    const who = [block.role, block.company].filter(Boolean).join(', ')
    return (
      <div key={block.id ?? block.name} className="container">
        <div className="cs-testimonial-section">
          <figure className="testimonial testimonial--large">
            <blockquote className="testimonial-quote">&ldquo;{block.quote}&rdquo;</blockquote>
            <figcaption className="testimonial-who">
              {face && (
                // eslint-disable-next-line @next/next/no-img-element -- media served from object storage, dimensions vary
                <img
                  className="testimonial-avatar"
                  src={face.url}
                  srcSet={face.srcSet ?? undefined}
                  sizes="64px"
                  alt={face.alt || block.name}
                  loading="lazy"
                />
              )}
              <span className="testimonial-credit">
                <span className="testimonial-name">{block.name}</span>
                {who && <span className="testimonial-role">{who}</span>}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    )
  }

  if (block.blockType === 'palette') {
    const swatches = (block.swatches ?? []).flatMap((s) => {
      const hex = safeHex(s.hex)
      return hex ? [{ ...s, hex }] : []
    })
    if (swatches.length === 0) return null

    return (
      <div key={block.id ?? 'palette'} className="container">
        <div className="cs-palette-section">
          <div className="cs-section-header">
            {block.label && <p className="cs-label">{block.label}</p>}
            <h3 className="cs-section-title">Color System</h3>
          </div>
          <ul className="cs-palette">
            {swatches.map((s) => (
              <li key={s.id ?? s.hex} className="cs-swatch">
                <span className="cs-swatch-chip" style={{ background: s.hex }} />
                <span className="cs-swatch-name">{s.name}</span>
                <span className="cs-swatch-hex">{s.hex.toUpperCase()}</span>
                {s.usage && <span className="cs-swatch-usage">{s.usage}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (block.blockType === 'typeSpecimen') {
    // `images` replaced a single `image` field. Mongo still holds whatever was
    // written before that, so the old one is read here rather than dropping a
    // specimen out of a published study — same reason as legacyText above.
    const legacy = mediaInfo((block as unknown as { image?: Parameters<typeof mediaInfo>[0] }).image)

    const sheets = (block.images ?? []).flatMap((row) => {
      const info = mediaInfo(row.media)
      return info ? [{ id: row.id, label: row.label, info }] : []
    })
    if (sheets.length === 0 && legacy) sheets.push({ id: 'legacy', label: null, info: legacy })

    if (sheets.length > 0) {
      return (
        <div key={block.id ?? 'type'} className="container">
          <div className="cs-type-section">
            <div className="cs-section-header">
              <p className="cs-label">{block.label || 'Typography'}</p>
              <h3 className="cs-section-title">Type Specimen</h3>
            </div>
            <div className="cs-face-sheet" data-count={sheets.length}>
              {sheets.map(({ id, label, info }) => (
                <figure key={id ?? info.url}>
                  <Media
                    src={info.url}
                    srcSet={info.srcSet}
                    sizes={
                      sheets.length > 1
                        ? '(max-width: 700px) 90vw, 30vw'
                        : '(max-width: 700px) 90vw, 44vw'
                    }
                    alt={info.alt || label || `Type specimen for ${post.title}`}
                    mimeType={info.mime}
                    width={info.width}
                    height={info.height}
                  />
                  {label && <figcaption>{label}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </div>
      )
    }

    const faces = block.faces ?? []
    if (faces.length === 0) return null

    return (
      <div key={block.id ?? 'type'} className="container">
        <div className="cs-type-section">
          <div className="cs-section-header">
            <p className="cs-label">{block.label || 'Typography'}</p>
            <h3 className="cs-section-title">Typography</h3>
          </div>
          <div className="cs-faces">
            {faces.map((f) => {
              const inFace = { fontFamily: `${JSON.stringify(f.family)}, var(--font-display)` }
              return (
                <figure key={f.id ?? f.family} className="cs-face">
                  <div className="cs-face-aa-col">
                    <p className="cs-face-aa" style={inFace}>
                      {f.sample || 'Aa'}
                    </p>
                  </div>
                  <div className="cs-face-details-col">
                    <p className="cs-face-set" style={inFace}>
                      {ALPHABET}
                    </p>
                    <p className="cs-face-set cs-face-numerals" style={inFace}>
                      {NUMERALS}
                    </p>
                    <figcaption className="cs-face-foot">
                      <span className="cs-face-family-name">{f.family}</span>
                      {f.notes && <span className="cs-face-notes">{f.notes}</span>}
                    </figcaption>
                  </div>
                </figure>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (block.blockType === 'gallery') {
    // flatMap rather than map+filter: it drops the rows whose upload
    // failed to resolve and narrows away the null in one step
    const shots = (block.images ?? []).flatMap((row) => {
      const info = mediaInfo(row.media)
      return info ? [{ id: row.id, label: row.label, info }] : []
    })
    if (shots.length === 0) return null

    return (
      <figure key={block.id ?? shots[0].info.url} className="cs-gallery container">
        <div
          className="cs-gallery-row"
          data-count={shots.length}
          // Natural unless a row explicitly asks to be cropped. The other way
          // round meant every row saved before this field existed — and every
          // row where an editor left it alone — got forced into a phone-portrait
          // box, which threw away two thirds of a landscape photograph.
          data-fit={block.fit === 'crop' ? 'crop' : 'natural'}
        >
          {shots.map(({ id, label, info }) => (
            <div key={id ?? info.url} className="cs-shot">
              <Media
                src={info.url}
                srcSet={info.srcSet}
                sizes={`${Math.round(100 / shots.length)}vw`}
                alt={info.alt || label || post.title}
                mimeType={info.mime}
                width={info.width}
                height={info.height}
              />
              {label && <span className="cs-shot-label">{label}</span>}
            </div>
          ))}
        </div>
        {block.caption && <Caption>{block.caption}</Caption>}
      </figure>
    )
  }

  if (block.blockType === 'deviceMockup') {
    const screen = mediaInfo(block.media)
    if (!screen) return null

    const device = deviceFor(block.device)
    const panel = safeHex(block.background)

    return (
      <figure
        key={block.id ?? screen.url}
        className={`cs-device cs-device--${block.display ?? 'wide'}`}
        data-size={block.size ?? 'large'}
        style={panel ? ({ '--device-panel': panel } as React.CSSProperties) : undefined}
      >
        <div className="cs-device-inner">
          <div
            className="device-mockup"
            data-fit={block.screenFit ?? 'top'}
            style={
              {
                '--device-frame': device.frame,
                '--device-screen': device.screen,
                '--device-screen-width': device.screenWidth,
                ...(safeHex(block.screenColor)
                  ? { '--device-screen-bg': safeHex(block.screenColor) }
                  : {}),
              } as React.CSSProperties
            }
          >
            <div className="device-mockup-screen">
              <Media
                src={screen.url}
                srcSet={screen.srcSet}
                sizes="(max-width: 900px) 100vw, 80vw"
                alt={screen.alt || block.caption || post.title}
                mimeType={screen.mime}
                width={screen.width}
                height={screen.height}
                ambient
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- static frame in public/, fixed intrinsic size */}
            <img className="device-mockup-frame" src={device.src} alt="" loading="lazy" />
          </div>
        </div>
        {block.caption && <Caption>{block.caption}</Caption>}
      </figure>
    )
  }

  const media = mediaInfo(block.media)
  if (!media) return null
  const display = block.display ?? 'full'

  // Ambient is the default for a clip, including one saved before the field
  // existed: a case study video is nearly always scenery, and the exception —
  // something with narration — is the one an editor goes and sets.
  const ambient = media.mime?.startsWith('video/') && (block.playback ?? 'ambient') === 'ambient'

  const caption = block.caption ? <Caption>{block.caption}</Caption> : null
  // A framed block is a tinted panel, so its caption belongs inside it. Left
  // outside, the tint stops at the image and the words sit on the page colour
  // below — which reads as the panel having ended early rather than as a caption.
  const captionInside = display === 'framed'

  return (
    <figure key={block.id ?? media.url} className={`cs-media cs-media--${display}`}>
      <div className="cs-media-inner">
        {ambient ? (
          <AmbientVideo src={media.url} label={media.alt || block.caption || post.title} />
        ) : (
          <Media
            src={media.url}
            srcSet={media.srcSet}
            sizes="100vw"
            alt={media.alt || block.caption || post.title}
            mimeType={media.mime}
            width={media.width}
            height={media.height}
          />
        )}
        {captionInside && caption}
      </div>
      {!captionInside && caption}
    </figure>
  )
}

/** Captions sit in the content column, so they line up with the copy around
 *  them rather than with the edge of whatever image they follow. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption>
      <Row>{children}</Row>
    </figcaption>
  )
}
