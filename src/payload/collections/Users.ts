import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

/**
 * Payload admin users collection.
 *
 * This is CMS editor accounts and nothing else — it is NOT the storefront
 * customer account. Customer auth stays in Medusa and is untouched by the
 * CMS migration.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  auth: true,
  access: {
    // Only signed-in admins may read or edit other users.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    create: authenticated,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'updatedAt'],
  },
  fields: [],
}
