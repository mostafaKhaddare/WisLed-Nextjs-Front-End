import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { namedGroup } from '../fields/group'
import { heroBannerFields } from '../fields/hero-banner'
import { heroSlidesFields } from '../fields/hero-slides'
import { revalidateHooks } from '../revalidate'

/**
 * Strapi: api::homepage.homepage  (singleType, collectionName "homepages")
 *
 *   kind            : singleType
 *   draftAndPublish : FALSE  -> versions: false
 *   HeroBanner      : homepage.hero-banner  single  +  Slides (carousel)
 *   MidBanner       : homepage.hero-banner  single  (same component, no
 *                                                displayName override)
 *
 * `Slides` lives only on HeroBanner: MidBanner is a static band with no
 * carousel, so it keeps the original single-headline shape.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: false,
  hooks: revalidateHooks('homepage'),

  fields: [
    namedGroup('HeroBanner', [...heroBannerFields(), ...heroSlidesFields()]),
    namedGroup('MidBanner', heroBannerFields()),
  ],
}
