import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

/**
 * Strapi: api::category.category
 * src/api/category/content-types/category/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : true      -> versions.drafts
 *   title           : string  required      (lowercase field name in Strapi)
 *   handle          : string  required      (NOT unique in Strapi — preserved)
 *   image           : media   multiple, required
 *   description     : text
 *
 * Kept separate from `collections` on purpose — see Collections.ts note.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'handle', type: 'text', required: true, index: true },
    { name: 'image', type: 'upload', relationTo: 'media', hasMany: true, required: true },
    { name: 'description', type: 'textarea' },
  ],
}
