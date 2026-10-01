import { s3Storage } from '@payloadcms/storage-s3'

/**
 * Object storage for Payload uploads.
 *
 * Why this exists
 * ---------------
 * Media used to be written to `public/media` on local disk. That works in
 * development but cannot survive a Vercel deployment:
 *
 *   - `public/` is baked into the build artifact and mounted read-only at
 *     runtime, so anything uploaded through the admin is lost on redeploy.
 *   - The repository gitignores `public/media`, so a GitHub-connected deploy
 *     ships none of the existing files either.
 *
 * Uploads therefore have to live in a bucket that outlives the container.
 *
 * Local development is unaffected: the plugin only activates when the S3
 * variables are present, so `npm run dev` keeps writing to disk.
 *
 * Required in production:
 *   S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 *
 * Optional (set for Cloudflare R2 or another S3-compatible provider):
 *   S3_ENDPOINT, S3_FORCE_PATH_STYLE
 */

const bucket = process.env.S3_BUCKET
const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

/**
 * Never throw at import time. The Payload config is imported by the Next.js
 * build, by the migration scripts and by the admin — all of which must keep
 * working on a machine (or a CI runner) that has no S3 credentials.
 */
export const isObjectStorageEnabled = Boolean(bucket && accessKeyId && secretAccessKey)

export const mediaStorage = s3Storage({
  enabled: isObjectStorageEnabled,
  bucket: bucket ?? 'disabled',

  collections: {
    media: {
      /**
       * Signed downloads are required, not optional.
       *
       * The S3 adapter builds URLs from the S3 API endpoint
       * (s3.<region>.backblazeb2.com). Backblaze authenticates *every* request
       * to that endpoint, including for buckets set to Public — public read
       * only works through the separate CDN URLs (f2.dev / f00X.backblazeb2.com
       * /file/<bucket>/...), which this adapter does not generate. Setting
       * signedDownloads to false would therefore 403 every image regardless of
       * the bucket's visibility setting.
       *
       * Signing sidesteps that entirely and keeps the bucket private, which is
       * the safer default for a bucket holding unpublished catalogue imagery.
       *
       * URLs expire, but Next.js' image optimizer fetches each file once and
       * serves the optimized result from its own cache, so expiry only matters
       * on a cache miss.
       */
      signedDownloads: true,
    },
  },

  config: {
    region: process.env.S3_REGION,
    // R2 and other S3-compatible providers require an explicit endpoint.
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
    ...(process.env.S3_FORCE_PATH_STYLE === '1' ? { forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: accessKeyId ?? '',
      secretAccessKey: secretAccessKey ?? '',
    },
  },

  /**
   * Upload from the browser straight to the bucket.
   *
   * Without this, every file passes through the Next.js server and is subject
   * to Vercel's request body limit, which will reject larger product imagery.
   * It requires the bucket to allow CORS `PUT` from your site origin:
   *
   *   AllowedMethods: [PUT, GET, HEAD]
   *   AllowedOrigins: [https://wisled.ma]
   */
  clientUploads: true,
})