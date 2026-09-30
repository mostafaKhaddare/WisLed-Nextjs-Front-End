import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Payload Media collection — replaces the Strapi `plugin::upload.file` library.
 *
 * Storage:
 *   Local disk under `public/media` in development, so files are served by
 *   Next.js from the existing public directory with no extra config.
 *   Production object storage is intentionally NOT configured here; adding
 *   @payloadcms/storage-s3 is a separate decision (see notes in payload.config.ts).
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
    // src/payload/collections/../../.. -> project root, then public/media
    staticDir: path.resolve(dirname, '..', '..', '..', 'public', 'media'),
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
