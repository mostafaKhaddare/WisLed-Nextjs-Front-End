import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AboutUs } from './payload/collections/AboutUs'
import { BlogPostCategories } from './payload/collections/BlogPostCategories'
import { Blogs } from './payload/collections/Blogs'
import { Categories } from './payload/collections/Categories'
import { Collections } from './payload/collections/Collections'
import { Inspirations } from './payload/collections/Inspirations'
import { Media } from './payload/collections/Media'
import { ProductVariantColors } from './payload/collections/ProductVariantColors'
import { Users } from './payload/collections/Users'
import { ContactUs } from './payload/globals/ContactUs'
import { Faq } from './payload/globals/Faq'
import { Homepage } from './payload/globals/Homepage'
import { PrivacyPolicy } from './payload/globals/PrivacyPolicy'
import { TermsAndCondition } from './payload/globals/TermsAndCondition'
import { mediaStorage } from './payload/storage'

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
  // Must match the mounted route group `src/app/(payload)/payload-admin`.
  // These live at the TOP level of the config, not under `admin.routes`:
  // `config.routes` is built only from `config.routes` (payload defaults.js),
  // so an `admin.routes.admin` value is silently ignored. Left at the default
  // `/admin`, every sidebar link, redirect and the post-login callback point at
  // a path that does not exist (404) and the panel is unusable.
  routes: {
    admin: '/payload-admin',
    api: '/api',
  },
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— WISLED CMS',
    },
  },
  editor: lexicalEditor(),
  // Sends Media uploads to S3/R2 when the S3_* variables are present, so files
  // survive a Vercel redeploy. Inactive locally — see src/payload/storage.ts.
  plugins: [mediaStorage],
  collections: [
    Users,
    Media,
    Collections,
    Categories,
    Blogs,
    BlogPostCategories,
    Inspirations,
    ProductVariantColors,
    AboutUs,
  ],
  globals: [
    Homepage,
    ContactUs,
    Faq,
    PrivacyPolicy,
    TermsAndCondition,
  ],
  db: postgresAdapter({
    pool: {
      /**
       * The Neon Vercel integration injects DATABASE_URL / DATABASE_URL_UNPOOLED,
       * not PAYLOAD_DATABASE_URI, so accept both and let an explicit Payload
       * variable win.
       *
       * The *unpooled* (direct) connection is preferred: it bypasses PgBouncer,
       * which Payload's postgres adapter does not work reliably with.
       */
      connectionString:
        process.env.PAYLOAD_DATABASE_URI ??
        process.env.DATABASE_URL_UNPOOLED ??
        process.env.DATABASE_URL,
    },
    // Dev-only convenience that syncs the schema straight from the config.
    // Off by default because it is NOT idempotent (drizzle-kit's dev push
    // re-issues DDL that can collide with constraints it just created) and
    // because production must use versioned migrations instead.
    // Set PAYLOAD_PUSH_SCHEMA=1 for a throwaway local database only.
    push: process.env.PAYLOAD_PUSH_SCHEMA === '1',
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET,
})
