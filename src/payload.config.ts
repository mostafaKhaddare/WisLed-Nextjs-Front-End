import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { BlogPostCategories } from './payload/collections/BlogPostCategories'
import { Blogs } from './payload/collections/Blogs'
import { Categories } from './payload/collections/Categories'
import { Collections } from './payload/collections/Collections'
import { Inspirations } from './payload/collections/Inspirations'
import { Media } from './payload/collections/Media'
import { ProductVariantColors } from './payload/collections/ProductVariantColors'
import { Users } from './payload/collections/Users'
import { AboutUs } from './payload/globals/AboutUs'
import { ContactUs } from './payload/globals/ContactUs'
import { Faq } from './payload/globals/Faq'
import { Homepage } from './payload/globals/Homepage'
import { PrivacyPolicy } from './payload/globals/PrivacyPolicy'
import { TermsAndCondition } from './payload/globals/TermsAndCondition'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Payload CMS configuration for WISLED.
 *
 * Responsibility split — Payload is CMS only. It never holds catalogue data.
 *   Payload : pages, homepage, blog, FAQs, banners, media, site content
 *   Medusa  : products, variants, prices, inventory, regions, cart, orders
 *
 * The only bridge between the two is `hotspot.product_handle`, a plain string
 * resolved against the Medusa Store API at render time.
 *
 * Database: a dedicated PostgreSQL instance. This is deliberately NOT Medusa's
 * DATABASE_URL — the two systems share no schema and no migration history.
 */
export default buildConfig({
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— WISLED CMS',
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Collections,
    Categories,
    Blogs,
    BlogPostCategories,
    Inspirations,
    ProductVariantColors,
  ],
  globals: [
    Homepage,
    AboutUs,
    ContactUs,
    Faq,
    PrivacyPolicy,
    TermsAndCondition,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URI,
    },
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET,
})
