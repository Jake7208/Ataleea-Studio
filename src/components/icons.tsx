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

/* The newsroom control icons. Deliberately the conventional shapes rather than
   drawn ones — a funnel means filter and a two-headed arrow means sort to
   everyone who has used a website, and a bespoke mark for either would be a
   puzzle in a place nobody wants one. Hairline stroke and currentColor keep
   them in the same family as the arrows above. */

export function Funnel({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('control-icon', className)}
      width="16"
      height="16"
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
      <path d="M3 5h18l-7 8.2V20l-4 1.6v-8.4L3 5Z" />
    </svg>
  )
}

/** Two-headed vertical arrow — the standard "change the order" mark. */
export function SortArrows({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('control-icon', className)}
      width="16"
      height="16"
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
      <path d="M7 3v18m0 0-3.5-3.5M7 21l3.5-3.5M17 21V3m0 0-3.5 3.5M17 3l3.5 3.5" />
    </svg>
  )
}

/** Rotated by CSS when its menu is open, so the mark states the menu's state. */
export function ChevronDown({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('chevron-icon', className)}
      width="14"
      height="14"
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
      <path d="m5 9 7 7 7-7" />
    </svg>
  )
}

/** Chain link — the conventional "copy this address" mark. */
export function LinkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('control-icon', className)}
      width="15"
      height="15"
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
      <path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7L11.6 7M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
    </svg>
  )
}

/** Marks the chosen row in a menu. The row also carries aria-checked. */
export function Check({ className, ...props }: IconProps) {
  return (
    <svg
      className={cx('check-icon', className)}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  )
}
