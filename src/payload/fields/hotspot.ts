import type { Field } from 'payload'

/**
 * Strapi component: sections.hotspot
 * src/components/sections/hotspot.json
 *
 *   product_handle : string  required
 *   position_x     : integer
 *   position_y     : integer
 *
 * Used by: inspiration.hotspots (repeatable)
 *
 * IMPORTANT — product_handle stays a plain string.
 * There is deliberately no Payload "products" collection: Medusa stays the
 * single source of truth for catalogue data. The storefront resolves this
 * handle through the Medusa Store API.
 *   Payload (hotspot.product_handle) -> Medusa -> product
 */
export const hotspotFields = (): Field[] => [
  { name: 'product_handle', type: 'text', required: true },
  { name: 'position_x', type: 'number' },
  { name: 'position_y', type: 'number' },
]
