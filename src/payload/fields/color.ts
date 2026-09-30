import type { BlocksField } from 'payload'

/**
 * Strapi dynamic zone: product-variant-color.Type
 * components: color-image.color-image | color-hex.color-hex
 *
 * A Strapi dynamic zone maps 1:1 to a Payload `blocks` field. Block slugs are
 * kept identical to the Strapi component UIDs so the migration is a direct
 * swap and existing consumers that discriminate on the presence of `Color` /
 * `Image` keep working.
 *
 *   color-image.color-image -> Image : media single (images, files)
 *   color-hex.color-hex     -> Color : string
 */
export const variantColorBlocks: BlocksField = {
  name: 'Type',
  type: 'blocks',
  labels: {
    singular: 'Colour variant',
    plural: 'Colour variants',
  },
  blocks: [
    {
      slug: 'color-image',
      labels: { singular: 'Colour image', plural: 'Colour images' },
      fields: [
        {
          name: 'Image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      slug: 'color-hex',
      labels: { singular: 'Colour hex', plural: 'Colour hexes' },
      fields: [
        { name: 'Color', type: 'text' },
      ],
    },
  ],
}
