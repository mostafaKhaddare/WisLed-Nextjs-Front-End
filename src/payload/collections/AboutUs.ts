import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import {
  contentSectionFields,
  numericalContentFields,
  whyUsFields,
} from '../fields/about-us'
import { namedGroup } from '../fields/group'

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
 *
 * MODELLED AS A SINGLETON COLLECTION, not a global.
 *
 * Strapi single types map cleanly onto Payload globals — five of the six still
 * do. This one cannot, and the failure is silent until the first read:
 * `findGlobal` asks drizzle for a `_numbers` relation that the postgres
 * adapter never creates, so every read throws
 *   "Cannot read properties of undefined (reading 'referencedTable')".
 * A single document whose array rows contain only scalar fields (Numbers) is
 * enough to trigger it, and no amount of schema pushing fixes it. contact-us
 * and faq are unaffected because their arrays nest or their rows carry
 * relationships, so this is specific to about-us' shape.
 *
 * A collection builds these relations correctly (see Inspirations.hotspots),
 * and it keeps the Strapi structure verbatim — `WhyUs` stays a real group with
 * a nested `Tile` array and `Banner` stays a single upload.
 *
 * The collection holds exactly one document; `getAboutUs()` in
 * src/lib/data/cms.ts reads it and the admin hides "Add New" by convention.
 */
export const AboutUs: CollectionConfig = {
  slug: 'about-us',
  labels: { singular: 'About Us', plural: 'About Us' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['OurStory.Title', 'updatedAt'],
    group: 'Content',
    description: 'Single record — the About Us page content.',
  },
  versions: { drafts: true },
  fields: [
    { name: 'Banner', type: 'upload', relationTo: 'media', hasMany: true },
    namedGroup('OurStory', contentSectionFields()),
    namedGroup('WhyUs', whyUsFields()),
    namedGroup('OurCraftsmanship', contentSectionFields()),
    // Named `KeyFigures`, not `Numbers`: Payload reserves the table suffix
    // `_numbers` for per-field numeric localization, so an array field called
    // `Numbers` produces the table `about_us_numbers`, which Payload then
    // mistakes for that localization table and asks drizzle to join via a
    // `_numbers` relation that does not exist. Every read fails with
    // "Cannot read properties of undefined (reading 'referencedTable')".
    // getAboutUs() maps `KeyFigures` back to `Numbers` for the frontend.
    {
      name: 'KeyFigures',
      type: 'array',
      fields: numericalContentFields(),
    },
  ],
}
