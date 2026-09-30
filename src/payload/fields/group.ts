import type { Field, GroupField } from 'payload'

/**
 * Reusable Strapi components are exported from `./fields/*` as BARE FIELD
 * LISTS, not as named groups.
 *
 * Payload array rows must be flat. A named group placed inside an array makes
 * Payload read and write `{ row: { ...component } }`, while Strapi stores the
 * component fields directly as `{ ...component }`. Keeping the helpers
 * un-named means the migrated data matches the admin UI without a reshaping
 * step, and it avoids silently losing required fields (Payload would report
 * them as missing because it looks for them one level deeper).
 *
 * Where Strapi genuinely nests a component under a key — a top-level
 * component field such as `homepage.HeroBanner` or `hero-banner.CTA` — wrap
 * the field list with `namedGroup`.
 */
export const namedGroup = (name: string, fields: Field[]): GroupField => ({
  name,
  type: 'group',
  fields,
})
