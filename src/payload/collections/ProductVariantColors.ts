import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { variantColorBlocks } from '../fields/color'
import { revalidateHooks } from '../revalidate'

/**
 * Strapi: api::product-variant-color.product-variant-color
 * src/api/product-variant-color/content-types/product-variant-color/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : FALSE     -> no versions.drafts
 *   Name            : string  required
 *   Type            : dynamiczone [color-image.color-image, color-hex.color-hex]
 *
 * NOTE: despite the name, this collection has no relationship to Medusa
 * products or variants in Strapi — it is only a lookup table of colour names
 * matched by string (`getVariantColor(variantName, colors)` compares
 * `c.Name === variantName`). Medusa stays the source of truth for variants.
 */
export const ProductVariantColors: CollectionConfig = {
  slug: 'product-variants-colors',
  labels: { singular: 'Variant colour', plural: 'Variant colours' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'Name',
    defaultColumns: ['Name'],
    group: 'Catalogue',
  },
  versions: false,
  hooks: revalidateHooks('product-variants-colors'),

  fields: [
    { name: 'Name', type: 'text', required: true },
    variantColorBlocks,
  ],
}
