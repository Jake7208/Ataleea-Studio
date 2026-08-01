'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { siteConfig } from '@/site.config'

export default function Header() {
  const pathname = usePathname()

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label={`${siteConfig.name} — home`}>
        {siteConfig.name}
      </Link>

      <nav className="site-nav">
        {siteConfig.nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="nav-link"
            aria-current={isActive(href) ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
