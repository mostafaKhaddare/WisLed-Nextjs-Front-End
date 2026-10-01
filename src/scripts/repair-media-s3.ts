import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

/**
 * Repair media rows whose file never reached the bucket.
 *
 * Context
 * -------
 * The bulk upload replayed every media document through Payload's upload path.
 * Transient TLS failures (this network intermittently corrupts the handshake
 * with B2) aborted some of them after the bytes had been written, leaving the
 * document pointing at an object that does not exist. Payload also renames on
 * collision, so the document's `filename` drifted to `sNN-8.ext` while the
 * pristine source stayed on disk as `sNN.ext` and was consumed on upload.
 *
 * This only touches documents whose current filename is genuinely absent from
 * the bucket, and resolves the local source by falling back from
 * `sNN-8.ext` to the base `sNN.ext`. Nothing already resolvable is re-uploaded,
 * which avoids another round of collision renames.
 *
 * Usage:
 *   node --import tsx src/scripts/repair-media-s3.ts
 *   DRY_RUN=1 node --import tsx src/scripts/repair-media-s3.ts
 */

const DRY_RUN = process.env.DRY_RUN === '1'

/** s41-7.png -> s41.png ; s8-8.webp -> s8.webp */
function baseName(filename: string): string {
  return filename.replace(/-\d+(\.[^.]+)$/, '$1')
}

function guessMime(filename: string): string {
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
  return map[path.extname(filename).toLowerCase()] ?? 'application/octet-stream'
}

async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    console.error('[repair] S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY must all be set.')
    process.exit(1)
  }

  const mediaDir = path.resolve(
    process.env.PAYLOAD_MEDIA_DIR ?? path.join(process.cwd(), 'public', 'media'),
  )

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const { S3Client, HeadObjectCommand, ListObjectsV2Command } = await import('@aws-sdk/client-s3')

  const payload = await getPayload({ config })

  // What is actually in the bucket.
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === '1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })

  const keys = new Set<string>()
  let token: string | undefined
  do {
    const res: any = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET,
        ContinuationToken: token,
        MaxKeys: 1000,
      }),
    )
    for (const o of res.Contents ?? []) keys.add(o.Key as string)
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)

  const { docs } = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 0,
    pagination: false,
  } as never)

  const broken = (docs as Array<{ id: string | number; filename: string }>).filter(
    (d) => !keys.has(d.filename),
  )

  console.log(`[repair] media docs      : ${(docs as unknown[]).length}`)
  console.log(`[repair] missing in bucket: ${broken.length}`)
  console.log(`[repair] dry run          : ${DRY_RUN}\n`)

  if (broken.length === 0) {
    console.log('[repair] nothing to do - every document resolves.')
    await payload.destroy()
    process.exit(0)
  }

  let fixed = 0
  const failed: string[] = []

  for (const doc of broken) {
    const base = baseName(doc.filename)
    const source = [doc.filename, base].map((n) => path.join(mediaDir, n)).find((p) => fs.existsSync(p))

    if (!source) {
      console.log(`  NO SOURCE  ${doc.filename} (also tried ${base})`)
      failed.push(doc.filename)
      continue
    }

    const size = Math.round(fs.statSync(source).size / 1024)
    if (DRY_RUN) {
      console.log(`  would fix  ${doc.filename}  <- ${path.basename(source)} (${size} KB)`)
      fixed++
      continue
    }

    try {
      const buffer = fs.readFileSync(source)
      const updated = await payload.update({
        collection: 'media',
        id: doc.id,
        file: {
          data: buffer,
          mimetype: guessMime(source),
          name: doc.filename,
          size: buffer.length,
        },
      } as never)
      const now = (updated as any).doc?.filename
      console.log(`  fixed      ${doc.filename} -> ${now} (${size} KB)`)
      fixed++
    } catch (error) {
      console.log(
        `  FAILED     ${doc.filename}: ${error instanceof Error ? error.message : error}`,
      )
      failed.push(doc.filename)
    }
  }

  console.log(`\n[repair] fixed  : ${fixed}`)
  console.log(`[repair] failed : ${failed.length}`)

  await payload.destroy()
  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[repair] FAILED:', err)
  process.exit(1)
})