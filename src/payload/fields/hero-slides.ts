import type { Field, ArrayField } from 'payload'

import { ctaFields } from './banners'

/**
 * Homepage hero carousel slides.
 *
 * The original hero model (`homepage.hero-banner`) carries ONE headline/CTA
 * alongside a multi-image `Image` upload, so the copy stayed pinned while the
 * photos slid underneath it. `Slides` adds the missing half of that story: a
 * repeatable row where a photo, its headline and its own button travel
 * together.
 *
 * Rows must be FLAT (see `./group.ts`): a named group inside an array makes
 * Payload read and write `{ row: { ...component } }`, so the CTA is inlined as
 * `BtnText`/`BtnLink` rather than nested under a `CTA` key. That keeps the
 * migrated Strapi data and the admin UI reading from the same shape.
 *
 * Added alongside the legacy fields rather than replacing them, so existing
 * content keeps working untouched and slides can be filled in gradually.
 */
export const heroSlidesField = (): ArrayField => ({
  name: 'Slides',
  type: 'array',
  admin: {
    description:
      "One row per hero image, each with its own headline and button. Leave empty to fall back to the single headline above with every image.",
  },
  fields: [
    {
      name: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'Headline',
      type: 'text',
      required: true,
    },
    {
      name: 'Text',
      type: 'textarea',
    },
    ...ctaFields(),
  ],
})

/** Alias so the field reads as a plain `Field[]` entry in a group. */
export const heroSlidesFields = (): Field[] => [heroSlidesField()]
