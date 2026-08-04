import React from 'react'

import type { CaseStudy } from '@/payload-types'
import Media from '@/components/Media'
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

/** One label/value pair in the header's fact column. */
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
 * The layout hangs off one idea: a single left rail, about a third of the way
 * across, that every piece of text shares — the facts, the intro, the body, the
 * captions. Only the title breaks it, starting out at the page margin, which is
 * what makes it read as the title rather than as more copy.
 *
 * The rail is why `.cs-grid` is repeated rather than each section sizing itself:
 * one grid definition, applied identically, is what keeps those left edges on
 * top of each other. The previous version centred the body text inside a
 * 1680px container while the header sat hard left, so the two never lined up.
 */
export default function ArticleBody({ post }: ArticleBodyProps) {
  const hero = mediaInfo(post.mainMedia)
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

  return (
    <article className="case-study">
      <header className="cs-head cs-grid container">
        <div className="cs-head-title">
          <p className="eyebrow">{post.year || published || 'Work'}</p>
          <h1>{post.title}</h1>
        </div>

        <div className="cs-head-meta">
          <dl className="cs-facts">
            {post.roles && <Fact label="Role">{post.roles}</Fact>}
            {post.location && <Fact label="Location">{post.location}</Fact>}
            {post.year && <Fact label="Year">{post.year}</Fact>}
            {post.collaborators && post.collaborators.length > 0 && (
              <Fact label="Credits">
                {post.collaborators.map((c) => (
                  <span key={c.id ?? `${c.role}-${c.name}`} className="cs-credit">
                    {c.role}, {c.name}
                  </span>
                ))}
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

          {/* The excerpt already exists as the card teaser and the SEO
              description; here it earns a third use as the intro paragraph,
              rather than asking for the same sentence to be written twice. */}
          {post.excerpt && <p className="cs-intro">{post.excerpt}</p>}
        </div>
      </header>

      {hero && (
        <div className="cs-hero full-media">
          <Media
            src={hero.url}
            srcSet={hero.srcSet}
            sizes="100vw"
            alt={hero.alt || post.title}
            mimeType={hero.mime}
            width={hero.width}
            height={hero.height}
            loading="eager"
          />
        </div>
      )}

      <div className="cs-body">
        {post.content?.map((block) => {
          if (block.blockType === 'text') {
            return (
              <div
                key={block.id ?? block.description.slice(0, 24)}
                className="cs-grid container cs-text-row"
              >
                <div className="cs-rail">
                  <p>{block.description}</p>
                </div>
              </div>
            )
          }

          if (block.blockType === 'statement') {
            return (
              <div
                key={block.id ?? block.text.slice(0, 24)}
                className="cs-grid container cs-statement-row"
              >
                <p className="cs-statement">{block.text}</p>
              </div>
            )
          }

          if (block.blockType === 'section') {
            return (
              <div
                key={block.id ?? block.heading}
                className="cs-grid container cs-section-row"
              >
                <div className="cs-rail">
                  {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
                  <h2 className="cs-section-heading">{block.heading}</h2>
                  {block.body && <p className="cs-section-body">{block.body}</p>}
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

            // Swatches on the rail, with the rest of the article's text — a
            // reference block rather than a full-bleed moment. Chip, name, hex,
            // then what the colour is for.
            return (
              <div key={block.id ?? 'palette'} className="cs-grid container cs-palette-row">
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
            )
          }

          if (block.blockType === 'typeSpecimen') {
            const faces = block.faces ?? []
            if (faces.length === 0) return null

            return (
              <div key={block.id ?? 'type'} className="cs-grid container cs-type-row">
                <dl className="cs-type">
                  {faces.map((f) => (
                    <div key={f.id ?? f.family} className="cs-type-face">
                      {/* the specimen is set in the face being described, with the
                          site's own stack behind it if that face isn't loaded */}
                      <dd
                        className="cs-type-sample"
                        style={{ fontFamily: `${JSON.stringify(f.family)}, var(--font-display)` }}
                      >
                        {f.sample || f.family}
                      </dd>
                      <dt>
                        <span className="cs-type-family">{f.family}</span>
                        {f.role && <span className="cs-type-role">{f.role}</span>}
                        {f.notes && <span className="cs-type-notes">{f.notes}</span>}
                      </dt>
                    </div>
                  ))}
                </dl>
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
              <figure key={block.id ?? shots[0].info.url} className="cs-gallery container-wide">
                <div className="cs-gallery-row" data-count={shots.length}>
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

          const media = mediaInfo(block.media)
          if (!media) return null
          const framed = block.display === 'framed'

          return (
            <figure
              key={block.id ?? media.url}
              className={framed ? 'cs-media cs-media--framed' : 'cs-media cs-media--full'}
            >
              <div className="cs-media-inner">
                <Media
                  src={media.url}
                  srcSet={media.srcSet}
                  sizes="100vw"
                  alt={media.alt || block.caption || post.title}
                  mimeType={media.mime}
                  width={media.width}
                  height={media.height}
                />
              </div>
              {block.caption && <Caption>{block.caption}</Caption>}
            </figure>
          )
        })}
      </div>
    </article>
  )
}

/** Captions sit on the rail like the body copy, not under the image edge. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="cs-grid container">
      <span className="cs-rail">{children}</span>
    </figcaption>
  )
}
