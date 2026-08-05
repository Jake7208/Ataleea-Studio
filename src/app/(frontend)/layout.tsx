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
  weight: ['400', '500'],
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
            content that is about to be hidden. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT + REVEAL_INIT }} />
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
