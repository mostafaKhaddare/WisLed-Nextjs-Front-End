import type { GroupField } from 'payload'

/**
 * Strapi component: homepage.cta
 * src/components/homepage/cta.json
 *
 *   BtnText : string
 *   BtnLink : string
 *
 * Used by: homepage.hero-banner (nested), contact-us.FormIntro (repeatable)
 */
export const ctaGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  admin: { description: 'Call to action button' },
  fields: [
    { name: 'BtnText', type: 'text' },
    { name: 'BtnLink', type: 'text' },
  ],
})
