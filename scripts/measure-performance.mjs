import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto(BASE, { waitUntil: 'commit' })

const metrics = await page.evaluate(() => {
  return new Promise((resolve) => {
    let lcpTime = 0
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      lcpTime = lastEntry.startTime
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })

    setTimeout(() => {
      observer.disconnect()
      const paint = window.performance.getEntriesByType('paint')
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime
      
      // Calculate Long Tasks (TBT proxy)
      const longTasks = window.performance.getEntriesByType('longtask') || []
      const tbtProxy = longTasks.reduce((sum, task) => sum + (task.duration - 50), 0)

      resolve({
        fcp: fcp ? Math.round(fcp) : 0,
        lcp: Math.round(lcpTime),
        tbtProxy: Math.round(tbtProxy),
        longTaskCount: longTasks.length
      })
    }, 1500)
  })
})

console.log('Performance Metrics:')
console.log(`  First Contentful Paint (FCP): ${metrics.fcp}ms`)
console.log(`  Largest Contentful Paint (LCP): ${metrics.lcp}ms`)
console.log(`  TBT (Long Task Blocking Time): ${metrics.tbtProxy}ms (${metrics.longTaskCount} long tasks)`)

await browser.close()
