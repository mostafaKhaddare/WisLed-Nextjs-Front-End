import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { revalidateHooks } from '../revalidate'

/**
 * Strapi: api::blog.blog
 * src/api/blog/content-types/blog/schema.json
 *
 *   kind            : collectionType
 *   draftAndPublish : true      -> versions.drafts
 *   Title           : string   required
 *   Slug            : uid, targetField Title
 *   Content         : richtext required
 *   FeaturedImage   : media    single, required
 *   Categories      : relation oneToMany -> blog-post-category
 *
 * `Content` was Strapi Markdown (rendered with react-markdown). It is now a
 * Payload Lexical richText field; the migration converts Markdown -> Lexical.
 *
 * The Categories relation is unidirectional in Strapi (no mappedBy / back
 * relation), so there is nothing to back-populate here.
 */
export const Blogs: CollectionConfig = {
  slug: 'blogs',
  labels: { singular: 'Blog', plural: 'Blogs' },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'Title',
    defaultColumns: ['Title', 'Slug', 'publishedAt'],
    group: 'Content',
  },
  versions: { drafts: true },
  hooks: revalidateHooks('blogs'),

  fields: [
    { name: 'Title', type: 'text', required: true },
    { name: 'Slug', type: 'text', unique: true, index: true },
    { name: 'Content', type: 'richText', required: true },
    { name: 'FeaturedImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'Categories',
      type: 'relationship',
      relationTo: 'blog-post-categories',
      hasMany: true,
    },
  ],
}
