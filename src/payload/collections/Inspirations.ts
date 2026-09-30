import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { hotspotFields } from '../fields/hotspot'

/**
 * Strapi: api::inspiration.inspiration
 * src/api/inspiration/content-types/inspiration/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : true      -> versions.drafts
 *   title           : string
 *   room_type       : enumeration (8 values, UPPERCASE accented labels)
 *   image           : media   multiple
 *   hotspots        : sections.hotspot repeatable
 *
 * `room_type` enum values are preserved VERBATIM, including accents and the
 * ampersand, so migrated content and any existing filter URLs keep matching.
 * Display labels were added in the Payload admin without changing the stored
 * values.
 */
const ROOM_TYPES = [
  'CUISINE MODERNE',
  'HÔTEL LUXE',
  'JARDIN & EXTÉRIEUR',
  'SALLE DE SPORT',
  'ENTREPÔT INDUSTRIEL',
  'SALLE DE BAIN',
  'SHOWROOM',
  'PISCINE',
]

export const Inspirations: CollectionConfig = {
  slug: 'inspirations',
  labels: { singular: 'Inspiration', plural: 'Inspirations' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'room_type', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'room_type',
      type: 'select',
      options: ROOM_TYPES.map((value) => ({
        value,
        label: value
          .toLowerCase()
          .replace(/^./, (c) => c.toUpperCase())
          .replace(/ & /, ' et '),
      })),
    },
    { name: 'image', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'hotspots',
      type: 'array',
      fields: hotspotFields(),
    },
  ],
}
