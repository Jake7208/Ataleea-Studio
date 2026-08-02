/**
 * Capture full-page screenshots of the front end at a couple of widths.
 *
 *   npm run dev            # in one terminal
 *   npm run screenshot     # in another
 *
 * Env: BASE_URL (default http://localhost:3000), OUT_DIR (default .screenshots),
 * ROUTES (comma-separated paths, overrides the default list).
 */
import { chromium } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT_DIR = process.env.OUT_DIR ?? '.screenshots'

const routes = process.env.ROUTES
  ? process.env.ROUTES.split(',').map((r) => [r.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'root', r])
  : [
      ['home', '/'],
      ['work', '/work'],
      ['journal', '/blog'],
      ['gallery', '/gallery'],
    ]

const viewports = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]

const problems = []

async function shoot(browser, label, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`[${label}] console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => problems.push(`[${label}] pageerror: ${err.message}`))

  for (const [name, route] of routes) {
    const url = new URL(route, BASE_URL).href
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })

    if (!res || !res.ok()) {
      problems.push(`[${label}] ${route} returned ${res ? res.status() : 'no response'}`)
    }

    // the dev-mode overlay is fixed-position and lands mid-page in a full-page shot
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })

    // IntersectionObserver never fires for content below the fold, so a full-page
    // shot would capture it mid-reveal. Put every target in its end state.
    const revealed = await page.evaluate(() => {
      const targets = document.querySelectorAll('[data-reveal]')
      targets.forEach((el) => el.classList.add('is-revealed'))
      return targets.length
    })
    if (revealed === 0) problems.push(`[${label}] ${route} has no [data-reveal] targets`)

    // longest stagger delay (0.21s) plus the 0.3s transition, with headroom
    await page.waitForTimeout(700)

    // web fonts load async — without this the shot captures fallback metrics
    await page.evaluate(() => document.fonts.ready)

    // full-bleed media is easy to overshoot; body overflow-x hides the symptom
    const overflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement
      return scrollWidth > clientWidth ? { scrollWidth, clientWidth } : null
    })
    if (overflow) {
      problems.push(
        `[${label}] ${route} overflows horizontally: ${overflow.scrollWidth}px content in ${overflow.clientWidth}px viewport`,
      )
    }

    const file = path.join(OUT_DIR, `${name}-${label}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log(`  ${file}`)
  }

  await context.close()
}

const browser = await chromium.launch()
try {
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  for (const [label, width, height] of viewports) {
    console.log(`${label} (${width}×${height}):`)
    await shoot(browser, label, width, height)
  }
} finally {
  await browser.close()
}

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  for (const p of problems) console.log(`  ${p}`)
  process.exitCode = 1
} else {
  console.log('\nNo console or page errors.')
}
