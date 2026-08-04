import React from 'react'

// Brand icons drawn with `currentColor` so they inherit the surrounding text color.
// The arrows are the studio's supplied artwork: a hairline shaft with swept barbs.

type IconProps = React.SVGProps<SVGSVGElement>

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base)

export function ArrowRight({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      width="22"
      height="13"
      viewBox="0 0 22 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M22 6.17798C22 6.17798 17.4271 6.17798 15.1416 0.177979M22 6.17798C22 6.17798 17.4271 6.17798 15.1416 12.178M22 6.17798L17.4271 6.17798H15.1416L3.1988e-07 6.17798" />
    </svg>
  )
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('arrow-icon', className)}
      width="22"
      height="13"
      viewBox="0 0 22 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M0.00195312 6.17798C0.00195312 6.17798 4.57484 6.17798 6.86037 12.178M0.00195312 6.17798C0.00195312 6.17798 4.57484 6.17798 6.86037 0.177979M0.00195312 6.17798L4.57484 6.17798H6.86037L22.002 6.17798" />
    </svg>
  )
}

// Half-filled disc for the theme toggle — a contrast mark rather than a
// sun/moon pair, so it stays one shape and one silhouette. The solid half swaps
// side by rotating 180°, which the stylesheet drives off the scheme itself.
export function Contrast({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('theme-toggle-icon', className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="8" cy="8" r="7" />
      <path d="M8 1a7 7 0 0 0 0 14Z" fill="currentColor" stroke="none" />
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
      strokeWidth="1.5"
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
