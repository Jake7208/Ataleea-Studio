import React from 'react'

// Minimal inline icons drawn with `currentColor` so they inherit the
// surrounding text color. Swap for your own icon set when styling.

type IconProps = React.SVGProps<SVGSVGElement>

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base)

export function ArrowRight({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M19 12H5m6-7-7 7 7 7" />
    </svg>
  )
}

// Outline heart that fills with `currentColor` when its button carries `.is-liked`.
export function Heart({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('heart-icon', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  )
}
