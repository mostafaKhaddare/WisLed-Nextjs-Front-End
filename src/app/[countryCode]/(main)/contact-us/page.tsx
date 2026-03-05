import { Metadata } from 'next'

import { getContactUs } from '@lib/data/fetch'
import { ContactHeaderSection } from '@modules/contact/components/contact-header-section'
import { ContactInfoSection } from '@modules/contact/components/contact-info-section'
import { ContactFormSection } from '@modules/contact/components/contact-form-section'

export const metadata: Metadata = {
  title: 'Contactez Wisled | Parlons de votre Éclairage',
  description:
    'Entrez en contact avec l’équipe Wisled. Nous sommes là pour répondre à vos questions sur nos solutions LED et systèmes DMX.',
}

export default async function ContactUsPage() {
  const result = await getContactUs()
  const { Header, ContactMethods, FormIntro } = result?.data ?? {}

  // Always render something — fallback for missing Strapi content
  const formIntro = FormIntro ?? {
    Title: 'Parlons de votre projet',
    Text: 'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.',
  }

  return (
    <>
      {/* Top Banner / Intro text */}
      {Header && <ContactHeaderSection data={Header} />}

      {/* Grid of Contact Details (Phone, Email, HQ) */}
      {ContactMethods && <ContactInfoSection data={ContactMethods} />}

      {/* The Actual Contact Form — always rendered with fallback data */}
      <ContactFormSection introData={formIntro} />
    </>
  )
}