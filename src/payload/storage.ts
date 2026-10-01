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
      // The storefront reads images directly from a URL, so serve them
      // publicly rather than issuing short-lived signed URLs. Set this to
      // `true` (or a `{ expiresIn }` object) if the bucket must stay private.
      signedDownloads: false,
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