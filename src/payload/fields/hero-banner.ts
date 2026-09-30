import type { Field } from 'payload'

import { ctaFields } from './banners'
import { namedGroup } from './group'

/**
 * Strapi component: homepage.hero-banner
 * src/components/homepage/hero-banner.json
 *
 *   Headline : string        required
 *   Text     : text
 *   CTA      : homepage.cta (single, nested)
 *   Image    : media         multiple
 *
 * Used by: homepage.HeroBanner (single), homepage.MidBanner (single).
 * Both Strapi fields point at this same component, so it is a shared group.
 * The CTA is a real Strapi sub-component, so it keeps its name.
 */
export const heroBannerFields = (): Field[] => [
  { name: 'Headline', type: 'text', required: true },
  { name: 'Text', type: 'textarea' },
  namedGroup('CTA', ctaFields()),
  {
    name: 'Image',
    type: 'upload',
    relationTo: 'media',
    hasMany: true,
  },
]
