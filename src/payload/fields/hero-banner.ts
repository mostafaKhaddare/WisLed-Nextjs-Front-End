import type { GroupField } from 'payload'

import { ctaGroup } from './banners'

/**
 * Strapi component: homepage.hero-banner
 * src/components/homepage/hero-banner.json
 *
 *   Headline : string        required
 *   Text     : text
 *   CTA      : homepage.cta (single)
 *   Image    : media         multiple
 *
 * Used by: homepage.HeroBanner (single), homepage.MidBanner (single).
 * Both Strapi fields point at this same component, so it is a shared group.
 */
export const heroBannerGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Headline', type: 'text', required: true },
    { name: 'Text', type: 'textarea' },
    ctaGroup('CTA'),
    {
      name: 'Image',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
})
