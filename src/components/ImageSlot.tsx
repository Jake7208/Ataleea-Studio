import React from 'react'

type ImageSlotProps = {
  /** Short name for the shot. */
  label: string
  /** One-line brief: subject and framing. */
  spec: string
  /** CSS aspect-ratio value, e.g. '16 / 9'. */
  ratio?: string
  className?: string
}

/**
 * Reserved space for artwork that hasn't been shot yet. Renders the brief in
 * place so the gap is obvious in the layout and in review — swap the whole
 * element for <Media> or an <img> once the real image exists.
 */
export default function ImageSlot({
  label,
  spec,
  ratio = '16 / 9',
  className = '',
}: ImageSlotProps) {
  return (
    <div
      className={`image-slot ${className}`.trim()}
      style={{ '--slot-ratio': ratio } as React.CSSProperties}
      role="img"
      aria-label={`Image placeholder — ${label}`}
    >
      <span className="image-slot-label">{label}</span>
      <span className="image-slot-spec">{spec}</span>
    </div>
  )
}
