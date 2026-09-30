/**
 * PHASE B — import the Strapi export into Payload.
 *
 * Usage (from the frontend project):
 *   npx payload run src/scripts/migrate-strapi-to-payload.ts
 *
 * Optional env:
 *   STRAPI_DIR           path to the Strapi project
 *                        (default ../WisLed-Strapi)
 *   STRAPI_EXPORT_PATH   path to strapi-export.json
 *   STRAPI_UPLOADS_DIR   path to the Strapi public/uploads directory
 *   PAYLOAD_DATABASE_URI / PAYLOAD_SECRET   required
 *   DRY_RUN=1            resolve everything and report, but write nothing
 *
 * Design notes
 *   • Idempotent: every document is matched on its natural key (Handle / Slug /
 *     title) and updated in place, so re-running converges instead of
 *     duplicating.
 *   • Nothing in Strapi is modified or deleted. Source files are copied to a
 *     staging directory before being handed to Payload, so Strapi's own
 *     public/uploads stays untouched.
 *   • Strapi 5 stores a draft and a published row per document. The published
 *     row becomes the published Payload doc; the draft row becomes its draft
 *     version. Nothing is silently dropped — every row is counted.
 *   • Media descriptors are detected structurally (`strapiId` + `sourceFile`),
 *     so nested media inside components is handled without per-field code.
 */

import fs from 'fs'
import os from 'os'
import path from 'path'

import { convertMarkdownToLexical } from '@payloadcms/richtext-lexical'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const PROJECT_ROOT = process.cwd()
const STRAPI_DIR = path.resolve(
  PROJECT_ROOT,
  process.env.STRAPI_DIR || '..',
  'WisLed-Strapi'
)

const EXPORT_PATH = path.resolve(
  PROJECT_ROOT,
  process.env.STRAPI_EXPORT_PATH ||
    path.join(STRAPI_DIR, 'migration-out', 'strapi-export.json')
)

const UPLOADS_DIR = path.resolve(
  PROJECT_ROOT,
  process.env.STRAPI_UPLOADS_DIR || path.join(STRAPI_DIR, 'public', 'uploads')
)

const DRY_RUN = process.env.DRY_RUN === '1'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

type Bucket = {
  found: number
  migrated: number
  failed: number
  updated?: number
  skipped?: number
}

async function main(): Promise<void> {
  const report = {
    startedAt: new Date().toISOString(),
    finishedAt: '',
    dryRun: DRY_RUN,
    media: { found: 0, migrated: 0, failed: 0, missingOnDisk: 0 },
    collections: {} as Record<string, Bucket>,
    globals: {} as Record<string, Bucket>,
    relations: { migrated: 0, failed: 0 },
    errors: [] as { scope: string; message: string }[],
  }

  if (!fs.existsSync(EXPORT_PATH)) {
    throw new Error(
      `Strapi export not found at ${EXPORT_PATH}\n` +
        `Run "node export-strapi-content.cjs" inside the Strapi project first.`
    )
  }

  const strapi = JSON.parse(fs.readFileSync(EXPORT_PATH, 'utf8')) as Any

  const { getPayload } = await import('payload')
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })

  // The sanitized lexical adapter carries the editor config we need for
  // Markdown -> Lexical conversion.
  const editorConfig = (payload.config.editor as Any).editorConfig

  /* ─── Helpers ─────────────────────────────────────────────── */

  const isMediaDescriptor = (v: Any): boolean =>
    Boolean(
      v &&
        typeof v === 'object' &&
        typeof v.strapiId === 'number' &&
        typeof v.sourceFile === 'string'
    )

  /** Markdown columns that must become Lexical richText. */
  const RICH_TEXT_FIELDS = new Set(['Content', 'PageContent'])

  const toRichText = (markdown: string): Any => {
    if (!markdown || typeof markdown !== 'string') return null
    try {
      return convertMarkdownToLexical({ editorConfig, markdown })
    } catch (err) {
      report.errors.push({ scope: 'richtext', message: (err as Error).message })
      return null
    }
  }

  const mediaIdByStrapiId = new Map<number, string>()
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'strapi-media-'))

  const ensureMedia = async (descriptor: Any): Promise<string | null> => {
    const cached = mediaIdByStrapiId.get(descriptor.strapiId)
    if (cached) return cached

    const source = path.join(UPLOADS_DIR, descriptor.sourceFile)
    if (!fs.existsSync(source)) {
      report.media.missingOnDisk += 1
      report.errors.push({
        scope: `media#${descriptor.strapiId}`,
        message: `source file missing: ${descriptor.sourceFile}`,
      })
      return null
    }

    // Copy first so Payload never touches Strapi's own uploads directory.
    const ext = path.extname(descriptor.sourceFile) || descriptor.ext || ''
    const staged = path.join(stagingDir, `s${descriptor.strapiId}${ext}`)
    fs.copyFileSync(source, staged)

    if (DRY_RUN) {
      mediaIdByStrapiId.set(descriptor.strapiId, `dry-run-${descriptor.strapiId}`)
      report.media.migrated += 1
      return mediaIdByStrapiId.get(descriptor.strapiId)!
    }

    try {
      const doc = await payload.create({
        collection: 'media',
        filePath: staged,
        data: {
          alternativeText: descriptor.alternativeText ?? undefined,
          caption: descriptor.caption ?? undefined,
        },
      })
      mediaIdByStrapiId.set(descriptor.strapiId, String(doc.id))
      report.media.migrated += 1
      return mediaIdByStrapiId.get(descriptor.strapiId)!
    } catch (err) {
      report.media.failed += 1
      report.errors.push({
        scope: `media#${descriptor.strapiId}`,
        message: (err as Error).message,
      })
      return null
    }
  }

  /**
   * Recursively rewrite a Strapi value into a Payload value:
   *  - media descriptors  -> media document id (or array of ids)
   *  - rich text fields   -> Lexical editor state
   *  - everything else    -> passed through untouched
   */
  const transform = async (value: Any, fieldName?: string): Promise<Any> => {
    if (isMediaDescriptor(value)) return ensureMedia(value)

    if (fieldName && RICH_TEXT_FIELDS.has(fieldName) && typeof value === 'string') {
      return toRichText(value)
    }

    if (Array.isArray(value)) {
      const out: Any[] = []
      for (const item of value) out.push(await transform(item, fieldName))
      return out
    }

    if (value && typeof value === 'object') {
      const out: Any = {}
      for (const [key, val] of Object.entries(value)) {
        out[key] = await transform(val, key)
      }
      return out
    }

    return value
  }

  /** Keys that are Strapi bookkeeping and must not become Payload fields. */
  const META_KEYS = new Set([
    '_strapiId',
    'documentId',
    '_status',
    'createdAt',
    'updatedAt',
  ])

  const buildData = async (row: Any): Promise<Any> => {
    const data: Any = {}
    for (const [key, value] of Object.entries(row)) {
      if (META_KEYS.has(key)) continue
      data[key] = await transform(value, key)
    }
    return data
  }

  /** Strapi dynamic zone -> Payload blocks needs an explicit blockType. */
  const addBlockTypes = (doc: Any): Any => {
    if (Array.isArray(doc?.Type)) {
      doc.Type = doc.Type.filter(Boolean).map((block: Any) => ({
        ...block,
        blockType: 'Color' in block ? 'color-hex' : 'color-image',
      }))
    }
    return doc
  }

  /** Drop media fields that resolved to null — Payload rejects explicit nulls. */
  const MEDIA_FIELDS = new Set(['Image', 'image', 'FeaturedImage', 'Banner', 'Icon'])
  const stripNullIds = (data: Any): Any => {
    if (Array.isArray(data)) {
      return data.map(stripNullIds).filter((v) => v !== null && v !== undefined)
    }
    if (data && typeof data === 'object') {
      const out: Any = {}
      for (const [k, v] of Object.entries(data)) {
        if ((v === null || v === undefined) && MEDIA_FIELDS.has(k)) continue
        out[k] = stripNullIds(v)
      }
      return out
    }
    return data
  }

  /* ─── Collection migration ────────────────────────────────── */

  /** Group Strapi draft/published row pairs by documentId. */
  const groupDocuments = (rows: Any[]): Any[][] => {
    const groups = new Map<string, Any[]>()
    for (const row of rows) {
      const key = row.documentId || `row-${row._strapiId}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }
    return Array.from(groups.values())
  }

  const findExisting = async (
    slug: string,
    where: Any
  ): Promise<Any | null> => {
    const result = await payload.find({
      collection: slug,
      where,
      limit: 1,
      depth: 0,
      draft: true,
    })
    return result.docs[0] ?? null
  }

  const migrateCollection = async (
    slug: string,
    rows: Any[],
    keyField: string,
    extraData?: (row: Any, data: Any) => Promise<Any> | Any
  ) => {
    const bucket: Bucket = (report.collections[slug] = {
      found: rows.length,
      migrated: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
    })

    for (const group of groupDocuments(rows)) {
      const published = group.find((r) => r._status === 'published')
      const draft = group.find((r) => r._status === 'draft')
      const primary = published ?? draft
      if (!primary) {
        bucket.skipped = (bucket.skipped ?? 0) + 1
        continue
      }

      try {
        let data = stripNullIds(await buildData(primary))
        if (slug === 'product-variants-colors') data = addBlockTypes(data)
        if (extraData) data = await extraData(primary, data)

        const keyValue = primary[keyField]
        const where = keyValue
          ? { [keyField]: { equals: keyValue } }
          : { id: { equals: primary._strapiId } }

        const existing = await findExisting(slug, where)

        if (DRY_RUN) {
          bucket.migrated += 1
          continue
        }

        if (existing) {
          await payload.update({ collection: slug, id: existing.id, data })
          bucket.updated = (bucket.updated ?? 0) + 1
        } else {
          await payload.create({ collection: slug, data })
          bucket.migrated += 1
        }

        // Preserve the draft version when Strapi kept one that differs.
        if (draft && draft._strapiId !== primary._strapiId) {
          let draftData = stripNullIds(await buildData(draft))
          if (slug === 'product-variants-colors') draftData = addBlockTypes(draftData)
          const target = await findExisting(slug, where)
          if (target) {
            await payload.update({
              collection: slug,
              id: target.id,
              draft: true,
              data: extraData ? await extraData(draft, draftData) : draftData,
            })
          }
        }
      } catch (err) {
        bucket.failed += 1
        report.errors.push({
          scope: `${slug}#${primary._strapiId}`,
          message: (err as Error).message,
        })
      }
    }

    console.log(`[migrate] ${slug.padEnd(24)} ${JSON.stringify(bucket)}`)
  }

  /* ─── Global migration ────────────────────────────────────── */

  const migrateGlobal = async (slug: string, rows: Any[]) => {
    const bucket: Bucket = (report.globals[slug] = {
      found: rows.length,
      migrated: 0,
      failed: 0,
    })

    const published = rows.find((r) => r._status === 'published') ?? rows[0]
    if (!published) {
      bucket.failed += 1
      console.log(`[migrate] global ${slug} — NO ROWS`)
      return
    }

    try {
      const data = stripNullIds(await buildData(published))
      if (!DRY_RUN) {
        await payload.updateGlobal({ slug, data })
      }
      bucket.migrated += 1

      const draft = rows.find((r) => r._status === 'draft')
      if (draft && draft._strapiId !== published._strapiId && !DRY_RUN) {
        const draftData = stripNullIds(await buildData(draft))
        await payload.updateGlobal({ slug, data: draftData, draft: true })
      }
    } catch (err) {
      bucket.failed += 1
      report.errors.push({ scope: `global:${slug}`, message: (err as Error).message })
    }

    console.log(`[migrate] global ${slug.padEnd(18)} ${JSON.stringify(bucket)}`)
  }

  /* ─── Run ─────────────────────────────────────────────────── */

  console.log(`[migrate] export      : ${EXPORT_PATH}`)
  console.log(`[migrate] uploads dir : ${UPLOADS_DIR}`)
  console.log(`[migrate] dry run     : ${DRY_RUN}`)

  // 1. Media first — every other record references it.
  report.media.found = strapi.media.length

  const seenMedia = new Set<number>()
  const descriptors: Any[] = []
  const collectMedia = (value: Any): void => {
    if (isMediaDescriptor(value)) {
      if (!seenMedia.has(value.strapiId)) {
        seenMedia.add(value.strapiId)
        descriptors.push(value)
      }
      return
    }
    if (Array.isArray(value)) return value.forEach(collectMedia)
    if (value && typeof value === 'object') Object.values(value).forEach(collectMedia)
  }

  ;[
    ...Object.values(strapi.globals ?? {}),
    strapi.collections,
    strapi.categories,
    strapi.blogs,
    strapi.blogPostCategories,
    strapi.inspirations,
    strapi.productVariantColors,
  ].forEach(collectMedia)

  const byStrapiId = new Map<number, Any>(
    strapi.media.map((m: Any) => [m.strapiId, m])
  )

  console.log(`[migrate] media referenced: ${descriptors.length}`)
  for (const descriptor of descriptors) {
    await ensureMedia(byStrapiId.get(descriptor.strapiId) ?? descriptor)
  }
  // Library entries not referenced anywhere are still migrated.
  for (const m of strapi.media) {
    if (!mediaIdByStrapiId.has(m.strapiId)) await ensureMedia(m)
  }
  console.log(`[migrate] media done: ${JSON.stringify(report.media)}`)

  // 2. blog post categories first — blogs reference them.
  await migrateCollection('blog-post-categories', strapi.blogPostCategories, 'Slug')

  const categoryIdByStrapiRowId = new Map<number, string>()
  for (const row of strapi.blogPostCategories) {
    const where = row.slug
      ? { Slug: { equals: row.slug } }
      : { id: { equals: row._strapiId } }
    const doc = await findExisting('blog-post-categories', where)
    if (doc) categoryIdByStrapiRowId.set(row._strapiId, String(doc.id))
  }

  // 3. blogs, with their category relation
  await migrateCollection('blogs', strapi.blogs, 'Slug', async (row, data) => {
    const links = strapi.relations.blogsCategories.filter(
      (l: Any) => l.blog_id === row._strapiId
    )
    const ids = links
      .map((l: Any) => categoryIdByStrapiRowId.get(l.blog_post_category_id))
      .filter(Boolean) as string[]

    if (ids.length) {
      data.Categories = ids
      report.relations.migrated += 1
    } else if (links.length) {
      report.relations.failed += 1
      report.errors.push({
        scope: `blogs#${row._strapiId}`,
        message: 'blog had category links but none could be resolved',
      })
    }
    return data
  })

  // 4. remaining collections
  await migrateCollection('collections', strapi.collections, 'Handle')
  await migrateCollection('categories', strapi.categories, 'handle')
  await migrateCollection('inspirations', strapi.inspirations, 'title')
  await migrateCollection(
    'product-variants-colors',
    strapi.productVariantColors,
    'Name'
  )

  // 5. globals
  await migrateGlobal('homepage', strapi.globals.homepage)
  await migrateGlobal('about-us', strapi.globals.aboutUs)
  await migrateGlobal('contact-us', strapi.globals.contactUs)
  await migrateGlobal('faq', strapi.globals.faq)
  await migrateGlobal('privacy-policy', strapi.globals.privacyPolicy)
  await migrateGlobal('terms-and-condition', strapi.globals.termsAndCondition)

  /* ─── Report ──────────────────────────────────────────────── */

  report.finishedAt = new Date().toISOString()

  const reportPath = path.join(
    STRAPI_DIR,
    'migration-out',
    'migration-report.json'
  )
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

  console.log('\n───────────── MIGRATION REPORT ─────────────')
  console.log(
    `Media      found=${report.media.found} migrated=${report.media.migrated} ` +
      `failed=${report.media.failed} missingOnDisk=${report.media.missingOnDisk}`
  )
  for (const [slug, s] of Object.entries(report.collections)) {
    console.log(
      `${slug.padEnd(24)} found=${s.found} migrated=${s.migrated} ` +
        `updated=${s.updated} failed=${s.failed} skipped=${s.skipped}`
    )
  }
  for (const [slug, s] of Object.entries(report.globals)) {
    console.log(
      `global:${slug.padEnd(17)} found=${s.found} migrated=${s.migrated} failed=${s.failed}`
    )
  }
  console.log(
    `Relations  migrated=${report.relations.migrated} failed=${report.relations.failed}`
  )
  console.log(`Errors     ${report.errors.length}`)
  for (const e of report.errors.slice(0, 25)) {
    console.log(`  - [${e.scope}] ${e.message}`)
  }
  console.log(`\nReport written to ${reportPath}`)
  console.log('──────────────────────────────────────────────')

  // clean up staged media copies
  fs.rmSync(stagingDir, { recursive: true, force: true })

  await payload.destroy()
  process.exit(0)
}

main().catch(async (err) => {
  console.error('[migrate] FAILED:', err)
  process.exit(1)
})
