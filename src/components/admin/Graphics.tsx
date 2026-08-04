import React from 'react'

import AtaleeaLogo, { AtaleeaMarkPaths, MARK_VIEWBOX } from '../AtaleeaLogo'

/**
 * The two brand marks Payload lets you replace.
 *
 * Styling for both is in `app/(payload)/custom.scss` — the frontend's own logo
 * CSS isn't loaded in the admin.
 */

/**
 * Login screen — the same mark-and-wordmark lockup the site header uses, set
 * large. Sits in `.login__brand`, which centres it.
 *
 * Deliberately no "Studio" line under it: the wordmark is horizontal, so a
 * word stacked beneath has nothing to align to and the brand uses no such
 * lockup anywhere else. The page title already reads "Ataleea Studio".
 */
export const AdminLogo: React.FC = () => (
  <div className="ataleea-logo ataleea-logo--full">
    <AtaleeaLogo height={44} />
  </div>
)

/**
 * Header breadcrumb, top left — the mark alone.
 *
 * Payload gives this slot a hard 18px square (`.step-nav__home`, 16px on small
 * screens) and its own icon fills it at 100%/100%. A fixed-pixel SVG just
 * overflows that box and gets clipped, so this one is sized by its container
 * exactly the same way. The viewBox is wider than it is tall, so the default
 * `preserveAspectRatio` letterboxes the mark inside the square rather than
 * cropping it.
 */
export const AdminIcon: React.FC = () => (
  <svg
    className="ataleea-icon"
    width="100%"
    height="100%"
    viewBox={MARK_VIEWBOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Ataleea"
  >
    <AtaleeaMarkPaths />
  </svg>
)
