import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { contentSectionGroup, numericalContentGroup, whyUsGroup } from '../fields/about-us'

/**
 * Strapi: api::about-us.about-us  (singleType, collectionName "about_uses")
 *
 *   kind            : singleType
 *   draftAndPublish : true   -> versions.drafts
 *   Banner          : media single, images
 *   OurStory        : about-us.content-section  (displayName "Content Section")
 *   WhyUs           : about-us.why-us
 *   OurCraftsmanship : about-us.content-section  (same component, no
 *                                             displayName — indistinguishable
 *                                             from OurStory in Strapi admin)
 *   Numbers         : about-us.numerical-content repeatable
 */
export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  label: 'About Us',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: { drafts: true },
  fields: [
    { name: 'Banner', type: 'upload', relationTo: 'media' },
    contentSectionGroup('OurStory'),
    whyUsGroup('WhyUs'),
    contentSectionGroup('OurCraftsmanship'),
    {
      name: 'Numbers',
      type: 'array',
      fields: [numericalContentGroup('row')],
    },
  ],
}
