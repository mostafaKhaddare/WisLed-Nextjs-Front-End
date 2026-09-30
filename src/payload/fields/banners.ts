import type { Field } from 'payload'

/**
 * Strapi component: homepage.cta
 * src/components/homepage/cta.json
 *
 *   BtnText : string
 *   BtnLink : string
 *
 * Used by: homepage.hero-banner (nested, named), contact-us.FormIntro
 * (repeatable, inlined)
 */
export const ctaFields = (): Field[] => [
  { name: 'BtnText', type: 'text' },
  { name: 'BtnLink', type: 'text' },
]
