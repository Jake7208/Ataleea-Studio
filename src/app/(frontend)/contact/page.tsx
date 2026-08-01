import type { Metadata } from 'next'
import React from 'react'

import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'CONTACT_PAGE_DESCRIPTION',
}

export default function ContactPage() {
  return (
    <section className="page-intro container contact-page">
      <p className="eyebrow">Contact</p>
      <h1>CONTACT_PAGE_HEADLINE</h1>
      <ContactForm />
    </section>
  )
}
