import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' })
await page.evaluate(() => {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'))
  document.querySelector('.hero-banner')?.scrollIntoView({ block: 'center', behavior: 'instant' })
})
await page.waitForTimeout(1200)

const clip = async () => {
  const r = await page.evaluate(() => {
    const b = document.querySelector('.hero-banner').getBoundingClientRect()
    return { x: 0, y: Math.max(b.top, 0), width: Math.round(b.width), height: Math.round(Math.min(b.height, innerHeight - Math.max(b.top, 0))) }
  })
  return r
}

// what a visitor looks at for the first ~450ms, and crossfades out of for 700ms more
await page.addStyleTag({ content: '.hero-banner-canvas{opacity:0!important;transition:none!important}' })
await page.screenshot({ path: '.boot-fallback.png', clip: await clip() })

console.log('captured the CSS fallback with the canvas hidden')
await browser.close()
