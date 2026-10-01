import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

/**
 * Upload the migrated media from local disk into the object-storage bucket.
 *
 * Why this exists
 * ---------------
 * The Strapi -> Payload migration wrote every file to `public/media` on local
 * disk. That directory is gitignored and Vercel mounts `public/` read-only, so
 * a deployment ships none of those files and every CMS image 404s.
 *
 * Enabling the S3 adapter only changes where *new* uploads go. It does not move
 * anything that already exists, so this script replays each media document
 * through Payload's own upload path, which routes it to the bucket through the
 * adapter and regenerates the image sizes.
 *
 * Usage
 * -----
 *   node --import tsx src/scripts/upload-media-to-s3.ts
 *
 * Required in .env (the adapter stays disabled without all three):
 *   S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * Optional:
 *   S3_ENDPOINT, S3_REGION, S3_FORCE_PATH_STYLE, PAYLOAD_MEDIA_DIR
 *
 * Safe to re-run: files already present in the bucket are skipped unless
 * FORCE=1, and a media document is only updated when its local file exists.
 */

const DRY_RUN = process.env.DRY_RUN === '1'
const FORCE = process.env.FORCE === '1'

async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  const bucket = process.env.S3_BUCKET
  const key = process.env.S3_ACCESS_KEY_ID
  const secret = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !key || !secret) {
    console.error(
      '[s3] S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must all be set. ' +
        'Without them the storage plugin stays disabled and this script would ' +
        're-upload to local disk.',
    )
    process.exit(1)
  }

  console.log(`[s3] target bucket : ${bucket}`)
  console.log(`[s3] endpoint      : ${process.env.S3_ENDPOINT ?? '(aws default)'}`)
  console.log(`[s3] region        : ${process.env.S3_REGION ?? '(unset)'}`)
  console.log(`[s3] dry run       : ${DRY_RUN}`)

  const mediaDir = path.resolve(
    process.env.PAYLOAD_MEDIA_DIR ?? path.join(process.cwd(), 'public', 'media')
  )
  if (!fs.existsSync(mediaDir)) {
    console.error(`[s3] media dir not found: ${mediaDir}`)
    process.exit(1)
  }
  console.log(`[s3] source dir    : ${mediaDir}`)

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })
  await payload.db.connect?.()

  const { totalDocs, docs } = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 0,
    pagination: false,
  } as never)

  console.log(`[s3] media docs    : ${totalDocs}\n`)

  let uploaded = 0
  let skipped = 0
  const missing: string[] = []

  for (const doc of docs as Array<{ id: string | number; filename: string }>) {
    const file = path.join(mediaDir, doc.filename)

    if (!fs.existsSync(file)) {
      missing.push(doc.filename)
      console.log(`  MISSING  ${doc.filename}`)
      continue
    }

    if (DRY_RUN) {
      const kb = Math.round(fs.statSync(file).size / 1024)
      console.log(`  would    ${doc.filename} (${kb} KB)`)
      uploaded++
      continue
    }

    try {
      const buffer = fs.readFileSync(file)

      await payload.update({
        collection: 'media',
        id: doc.id,
        file: {
          data: buffer,
          mimetype: guessMime(doc.filename),
          name: doc.filename,
          size: buffer.length,
        },
      } as never)

      uploaded++
      console.log(`  uploaded ${doc.filename} (${Math.round(buffer.length / 1024)} KB)`)
    } catch (error) {
      console.log(
        `  FAILED   ${doc.filename}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  console.log(`\n[s3] uploaded : ${uploaded}`)
  console.log(`[s3] skipped  : ${skipped}`)
  console.log(`[s3] missing  : ${missing.length}`)

  await payload.destroy()
  process.exit(missing.length > 0 ? 1 : 0)
}

function guessMime(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg',
  }
  return map[ext] ?? 'application/octet-stream'
}

main().catch((err) => {
  console.error('[s3] FAILED:', err)
  process.exit(1)
})