import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { revalidateHooks } from '../revalidate'

/**
 * Strapi: api::collection.collection
 * src/api/collection/content-types/collection/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : true      -> versions.drafts
 *   Title           : string  required
 *   Handle          : string  required, unique
 *   Image           : media   single, images only, required
 *   Description     : text    required
 *
 * NOTE: `collection` (PascalCase, unique Handle) and `category` (camelCase,
 * non-unique handle) are near-duplicate concepts in Strapi. They are kept as
 * two separate collections here rather than merged — merging would change the
 * storefront's data contract.
 */
export const Collections: CollectionConfig = {
  slug: 'collections',
  labels: { singular: 'Collection', plural: 'Collections' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'Title',
    defaultColumns: ['Title', 'Handle', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true },
  hooks: revalidateHooks('collections'),

  fields: [
    { name: 'Title', type: 'text', required: true },
    { name: 'Handle', type: 'text', required: true, unique: true, index: true },
    { name: 'Image', type: 'upload', relationTo: 'media', required: true },
    { name: 'Description', type: 'textarea', required: true },
  ],
}
