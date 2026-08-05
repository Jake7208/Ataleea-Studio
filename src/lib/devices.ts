/**
 * Device frames for the mockup block.
 *
 * Each frame is a PNG whose screen is a hole punched clean through the alpha
 * channel. The screen content is laid underneath and the frame painted over the
 * top, so the bezel masks the content's square corners and the notch covers the
 * strip it sits in — no clipping path, no mask, just z-order.
 *
 * The three numbers per device were measured off the alpha channel rather than
 * eyeballed: flood-fill the transparent region enclosed by the bezel, take its
 * bounding box, and express it against the frame. Apple's art is drawn with the
 * display exactly centred, so there is no offset to carry — if a future frame
 * is not centred, this table needs an inset pair as well.
 *
 * Source: Apple Design Resources (Bezel, MacBook Pro M5). The bundled licence
 * sits beside the images in public/devices/ — it permits showing your own work
 * on Apple hardware, and forbids altering the device art itself. Resizing and
 * recompressing for delivery is fine; recolouring the frames is not.
 */
export type DeviceId =
  | 'mbp16-space-black'
  | 'mbp16-silver'
  | 'mbp14-space-black'
  | 'mbp14-silver'

export type Device = {
  label: string
  src: string
  /** Aspect ratio of the frame image itself. */
  frame: string
  /** Aspect ratio of the screen cutout — the shape to export artwork at. */
  screen: string
  /** Cutout width as a percentage of the frame's width. */
  screenWidth: string
  /** Native panel resolution, quoted to editors so exports land pixel-exact. */
  native: string
}

export const DEVICES: Record<DeviceId, Device> = {
  'mbp16-space-black': {
    label: 'MacBook Pro 16" — Space Black',
    src: '/devices/macbook-pro-m5-16-inch-space-black.png',
    frame: '4260 / 2840',
    screen: '3456 / 2234',
    screenWidth: '81.127%',
    native: '3456 × 2234',
  },
  'mbp16-silver': {
    label: 'MacBook Pro 16" — Silver',
    src: '/devices/macbook-pro-m5-16-inch-silver.png',
    frame: '4260 / 2840',
    screen: '3456 / 2234',
    screenWidth: '81.127%',
    native: '3456 × 2234',
  },
  'mbp14-space-black': {
    label: 'MacBook Pro 14" — Space Black',
    src: '/devices/macbook-pro-m5-14-inch-space-black.png',
    frame: '3860 / 2540',
    screen: '3024 / 1964',
    screenWidth: '78.342%',
    native: '3024 × 1964',
  },
  'mbp14-silver': {
    label: 'MacBook Pro 14" — Silver',
    src: '/devices/macbook-pro-m5-14-inch-silver.png',
    frame: '3860 / 2540',
    screen: '3024 / 1964',
    screenWidth: '78.342%',
    native: '3024 × 1964',
  },
}

export const DEFAULT_DEVICE: DeviceId = 'mbp16-space-black'

/** Narrows a stored value to a device we actually ship a frame for. */
export const deviceFor = (value?: string | null): Device =>
  DEVICES[(value ?? '') as DeviceId] ?? DEVICES[DEFAULT_DEVICE]

/** The block's options list, so the dropdown can't drift from the table. */
export const deviceOptions = (Object.keys(DEVICES) as DeviceId[]).map((value) => ({
  label: DEVICES[value].label,
  value,
}))
