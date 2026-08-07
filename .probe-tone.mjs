import { chromium } from 'playwright'
import sharp from 'sharp'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' })

for (const sel of ['.hero-banner:not(.hero-banner-band)', '.hero-banner-band']) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center', behavior: 'instant' }), sel)
  await page.waitForTimeout(1500)
  // hide everything sitting on the field so only the field is sampled
  await page.addStyleTag({ content: '.hero-banner-content,.hero-banner-line{visibility:hidden!important}' })
  const clip = await page.evaluate((s) => {
    const b = document.querySelector(s).getBoundingClientRect()
    return { x: 0, y: Math.max(b.top, 0), width: Math.round(b.width), height: Math.round(Math.min(b.height, innerHeight - Math.max(b.top, 0))) }
  }, sel)
  const buf = await page.screenshot({ clip })
  const { channels } = await sharp(buf).stats()
  const [r, g, b] = channels.map((c) => Math.round(c.mean))
  const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  const med = channels.map((c) => Math.round(c.median ?? c.mean))
  const medHex = '#' + med.map((v) => v.toString(16).padStart(2, '0')).join('')
  console.log(`${sel.padEnd(34)} mean ${hex}  median ${medHex}`)
}

await browser.close()
