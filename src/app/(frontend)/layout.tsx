import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ContactPanelProvider } from '@/components/ContactPanel'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageTransition from '@/components/PageTransition'
import ScrollReveal from '@/components/ScrollReveal'
import SmoothScroll from '@/components/SmoothScroll'
import './styles.css'

export const metadata: Metadata = {
  // absolute-URL base for the social cards and any canonical below it
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Pages set their own title/description; these carry through to the cards,
  // and the image comes from opengraph-image.tsx alongside this file.
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    locale: 'en_US',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

/**
 * Both faces are fetched at build time and served from this origin.
 *
 * They used to arrive through an `@import` of the Google Fonts stylesheet at the
 * top of styles.css, which is the slowest way to load a font: the browser has to
 * fetch styles.css, parse it, fetch Google's stylesheet, parse that, and only
 * then start on the woff2 files — three serial round trips to two other origins
 * before a word of text can render. It also put a third-party request on every
 * page, which is the part that shows up in the DevTools Issues tab.
 *
 * `display: swap` keeps the fallback visible while the real face loads, and the
 * variables below are what styles.css reads through --font-display/--font-text.
 */
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

// Runs before first paint so reveal targets are hidden without a flash — and,
// crucially, stay visible if JavaScript never runs.
const REVEAL_INIT = `try{var e=document.documentElement;e.setAttribute('data-reveal-ready','');if(matchMedia('(prefers-reduced-motion: reduce)').matches){e.setAttribute('data-reveal-off','')}}catch(_){}`

/**
 * The first-load entry cascade, run from the parser rather than from React.
 *
 * ScrollReveal used to own this. The cost of that was invisible in the source
 * and enormous in practice: REVEAL_INIT above puts every `[data-reveal]` at
 * opacity 0, and nothing took them back off it until the client bundle had
 * downloaded, parsed and hydrated. On a production build served over localhost
 * that was 1.2 seconds, for the whole of which the hero — headline, lead and
 * banner, the entire top of the page — was blank. An element at opacity 0 is not
 * a paint, so that number was the site's Largest Contentful Paint more or less
 * exactly.
 *
 * Nothing about a fade needs React. DOMContentLoaded lands in tens of
 * milliseconds because the markup is static, so the cascade starts there and
 * ScrollReveal is left doing the scroll reveals it is named for. The two halves
 * meet at `is-intro`: this marks the elements it has taken, and ScrollReveal
 * skips anything already marked rather than firing its observer at them and
 * flattening the stagger.
 *
 * The font hold and the stagger are the ones ScrollReveal used, and are
 * explained there — this is a move, not a rewrite.
 *
 * Before it marks anything it looks for a `[data-reveal='rise']` element in the
 * opening screen and, if it finds one with real presence there, sets
 * `data-intro-fade` on <html>. That attribute is the cascade's licence to carry
 * its fade in the stagger again rather than lighting every element at once —
 * see the note on it in styles.css for what it buys and what it costs. A rise
 * element is by definition the page's Largest Contentful Paint candidate and is
 * opaque from the first frame, so on a page that has one, nothing behind it can
 * move the metric. The 30%-of-viewport test is the check that it really is that
 * element: on a short enough window the banner is a sliver at the bottom of the
 * screen, the headline is the largest thing on it after all, and the safe
 * lit-at-once cascade is the one that should run.
 *
 * It marks elements with `data-intro`/`data-shown` rather than with classes.
 * That is not a style preference: this runs before hydration, and className is a
 * prop React rendered and therefore checks. Adding to it here is a hydration
 * mismatch — React reports it and, having reported it, leaves it alone, so the
 * classes survive on borrowed time until anything re-renders that element and
 * drops them. A data attribute React never rendered is not part of that
 * comparison, so nothing is being fought over.
 */
const INTRO_INIT = `try{
var d=document,e=d.documentElement,S=90,W=400;
var start=function(){
var lead=d.querySelector('[data-reveal="rise"]');
if(lead){var lr=lead.getBoundingClientRect();
if(Math.min(lr.bottom,innerHeight)-Math.max(lr.top,0)>innerHeight*0.3)e.setAttribute('data-intro-fade','')}
var els=d.querySelectorAll('[data-reveal]'),i=0;
for(var n=0;n<els.length;n++){
var el=els[n],r=el.getBoundingClientRect();
if(r.top>=innerHeight||r.bottom<=0)continue;
el.setAttribute('data-intro','');
(function(x,k){setTimeout(function(){x.setAttribute('data-shown','')},k*S)})(el,i++)}};
var go=function(){
if(e.hasAttribute('data-reveal-off'))return;
var f=d.fonts&&d.fonts.ready;
if(f)Promise.race([f,new Promise(function(r){setTimeout(r,W)})]).then(start);else start()};
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',go);else go()
}catch(_){}`

// Replays a saved theme choice before anything paints, so a visitor who picked
// against their OS doesn't get a frame of the other scheme first. Absent a
// saved choice it sets nothing and prefers-color-scheme keeps deciding.
const THEME_INIT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(_){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script stamps attributes on <html>
    // before React hydrates
    <html lang="en" className={`${interTight.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* In <head> and parser-blocking, so it has run before the body is
            parsed and therefore before anything paints. Both attributes it sets
            are read by CSS that would otherwise flash the wrong scheme or show
            content that is about to be hidden. INTRO_INIT only arms a listener
            here; its work happens at DOMContentLoaded. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT + REVEAL_INIT + INTRO_INIT }} />
      </head>
      <body>
        <SmoothScroll />
        <ScrollReveal />
        <ContactPanelProvider>
          <Header />
          {/* renders the <main> element, and fades it across route changes */}
          <PageTransition>{children}</PageTransition>
          <Footer />
        </ContactPanelProvider>
      </body>
    </html>
  )
}
