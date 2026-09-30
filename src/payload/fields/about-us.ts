import type { GroupField } from 'payload'

/**
 * Strapi component: about-us.content-section
 * src/components/about-us/content-section.json
 * (displayName "ImageTextContentSection")
 *
 *   Title : string  required
 *   Text  : text    required
 *   Image : media   single, images only, required
 *
 * Used by: about-us.OurStory, about-us.OurCraftsmanship
 */
export const contentSectionGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text', required: true },
    { name: 'Text', type: 'textarea', required: true },
    {
      name: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
})

/**
 * Strapi component: about-us.tile
 * src/components/about-us/tile.json
 *
 *   Image : media   single, required
 *   Title : string  required
 *   Text  : text    required
 *
 * Used by: about-us.why-us.Tile (repeatable)
 */
export const tileGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    {
      name: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'Title', type: 'text', required: true },
    { name: 'Text', type: 'textarea', required: true },
  ],
})

/**
 * Strapi component: about-us.why-us
 * src/components/about-us/why-us.json
 * (displayName "FramedTextContentSection")
 *
 *   Title : string              required
 *   Tile  : about-us.tile       repeatable
 */
export const whyUsGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text', required: true },
    {
      name: 'Tile',
      type: 'array',
      fields: [tileGroup('row')],
    },
  ],
})

/**
 * Strapi component: about-us.numerical-content
 * src/components/about-us/numerical-content.json
 * (displayName "NumericalContentSection")
 *
 *   Title : string  required
 *   Text  : string  required
 *
 * Used by: about-us.Numbers (repeatable)
 */
export const numericalContentGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text', required: true },
    { name: 'Text', type: 'text', required: true },
  ],
})
