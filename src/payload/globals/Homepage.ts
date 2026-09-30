import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { heroBannerGroup } from '../fields/hero-banner'

/**
 * Strapi: api::homepage.homepage  (singleType, collectionName "homepages")
 *
 *   kind            : singleType
 *   draftAndPublish : FALSE  -> versions: false
 *   HeroBanner      : homepage.hero-banner  single
 *   MidBanner       : homepage.hero-banner  single  (same component, no
 *                                                displayName override)
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: false,
  fields: [heroBannerGroup('HeroBanner'), heroBannerGroup('MidBanner')],
}
