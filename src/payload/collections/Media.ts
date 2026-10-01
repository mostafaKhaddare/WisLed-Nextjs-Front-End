import path from 'path'

import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { revalidateHooks } from '../revalidate'

/**
 * Payload Media collection — replaces the Strapi `plugin::upload.file` library.
 *
 * Storage:
 *   Local disk under `public/media` in development, so files are served by
 *   Next.js from the existing public directory with no extra config.
 *   In production the `mediaStorage` plugin in `src/payload/storage.ts`
 *   redirects uploads to S3/R2, because `public/` is read-only and wiped on
 *   every Vercel redeploy. The `staticDir` below is only a local fallback.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'filename',
    group: 'Media',
  },
  upload: {
    // Resolved from the working directory rather than from `import.meta.url`
    // on purpose: the migration and admin scripts are bundled with esbuild
    // before they run, which rewrites `import.meta.url` to the bundle's
    // location. Resolving from the module path made the bundled migration
    // write its uploads three directories above the project root. Both Next
    // and the scripts run with the project root as the working directory, so
    // cwd is the stable anchor; PAYLOAD_MEDIA_DIR overrides it where the
    // process does not start in the project root (e.g. a deploy that mounts
    // an upload volume elsewhere).
    staticDir: path.resolve(
      process.env.PAYLOAD_MEDIA_DIR ?? path.join(process.cwd(), 'public', 'media')
    ),
    // Union of every `allowedTypes` used across the Strapi schemas:
    // images, files, videos, audios.
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'banner', width: 1920, height: 820, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  hooks: revalidateHooks('media'),

  fields: [
    {
      name: 'alternativeText',
      type: 'text',
      admin: { description: 'Alt text, migrated from Strapi alternativeText' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Caption, migrated from Strapi caption' },
    },
  ],
}
