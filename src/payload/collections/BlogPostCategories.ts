import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { revalidateHooks } from '../revalidate'

/**
 * Strapi: api::blog-post-category.blog-post-category
 * src/api/blog-post-category/content-types/blog-post-category/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : true      -> versions.drafts
 *   Title           : string
 *   Slug            : uid, targetField Title
 */
export const BlogPostCategories: CollectionConfig = {
  slug: 'blog-post-categories',
  labels: { singular: 'Blog post category', plural: 'Blog post categories' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'Title',
    defaultColumns: ['Title', 'Slug'],
    group: 'Content',
  },
  versions: { drafts: true },
  hooks: revalidateHooks('blog-post-categories'),

  fields: [
    { name: 'Title', type: 'text' },
    { name: 'Slug', type: 'text', unique: true, index: true },
  ],
}
