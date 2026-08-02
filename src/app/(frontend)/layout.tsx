import type { Metadata } from 'next'
import React from 'react'

import { siteConfig } from '@/site.config'
import { ContactPanelProvider } from '@/components/ContactPanel'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ScrollReveal from '@/components/ScrollReveal'
import SmoothScroll from '@/components/SmoothScroll'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

// Runs before first paint so reveal targets are hidden without a flash — and,
// crucially, stay visible if JavaScript never runs.
const REVEAL_INIT = `try{var e=document.documentElement;e.setAttribute('data-reveal-ready','');if(matchMedia('(prefers-reduced-motion: reduce)').matches){e.setAttribute('data-reveal-off','')}}catch(_){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script stamps attributes on <html>
    // before React hydrates
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_INIT }} />
        <SmoothScroll />
        <ScrollReveal />
        <ContactPanelProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ContactPanelProvider>
      </body>
    </html>
  )
}
