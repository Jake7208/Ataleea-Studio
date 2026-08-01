import type { Metadata } from 'next'
import React from 'react'

import { siteConfig } from '@/site.config'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
