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

  const toRichText = (markdown: string): Any => {
    if (!markdown || typeof markdown !== 'string') return null
    try {
      return convertMarkdownToLexical({ editorConfig, markdown })
    } catch (err) {
      report.errors.push({ scope: 'richtext', message: (err as Error).message })
      return null
    }
  }

  const mediaDocByStrapiId = new Map<number, Any>()
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'strapi-media-'))

  /**
   * Imports one Strapi file into Payload's media collection and returns the
   * created document.
   *
   * Returns the whole doc rather than a bare id: Payload's upload field
   * rejects a plain id string ("This relationship field has the following
   * invalid relationships: <id> 0") but accepts the document itself.
   */
  const ensureMedia = async (descriptor: Any): Promise<Any | null> => {
    const cached = mediaDocByStrapiId.get(descriptor.strapiId)
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
      const stub = { id: `dry-run-${descriptor.strapiId}` }
      mediaDocByStrapiId.set(descriptor.strapiId, stub)
      report.media.migrated += 1
      return stub
    }

    try {
      // The staged basename is derived from the Strapi media id, so it is a
      // stable unique key: reuse an existing upload instead of duplicating it
      // on every re-run.
      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: path.basename(staged) } },
        limit: 1,
        depth: 0,
      })

      const doc = existing.docs[0]
        ? await payload.update({
            collection: 'media',
            id: existing.docs[0].id,
            data: {
              alternativeText: descriptor.alternativeText ?? undefined,
              caption: descriptor.caption ?? undefined,
            },
          })
        : await payload.create({
            collection: 'media',
            filePath: staged,
            data: {
              alternativeText: descriptor.alternativeText ?? undefined,
              caption: descriptor.caption ?? undefined,
            },
          })

      mediaDocByStrapiId.set(descriptor.strapiId, doc)
      report.media.migrated += 1
      return doc
    } catch (err) {
      report.media.failed += 1
      report.errors.push({
        scope: `media#${descriptor.strapiId}`,
        message: describeError(err),
      })
      return null
    }
  }

  /* ─── Schema-aware transform ───────────────────────────────── */

  const fieldIndex = (fields: Any[] | undefined): Map<string, Any> => {
    const map = new Map<string, Any>()
    for (const f of fields ?? []) if (f?.name) map.set(f.name, f)
    return map
  }

  const collectionFields = (slug: string): Any[] | undefined =>
    (payload.config.collections as Any[]).find((c) => c.slug === slug)?.fields

  const globalFields = (slug: string): Any[] | undefined =>
    (payload.config.globals as Any[]).find((g) => g.slug === slug)?.fields

  /**
   * Strapi field names that Payload cannot store verbatim. Keyed by the name of
   * the field the value was read from (the collection/global slug at the top
   * level). src/lib/data/cms.ts renames them back for the frontend.
   *   - contact-grid.ContactMethods repeats its own parent array name, which
   *     drizzle refuses to model ("There are multiple relations with name
   *     \"ContactMethods\""), so the inner array is stored as `Cards`.
   *   - about-us.Numbers would build the table `about_us_numbers`, which Payload
   *     mistakes for its reserved `_numbers` localization table, so the field is
   *     stored as `KeyFigures`.
   */
  const FIELD_RENAMES: Record<string, Record<string, string>> = {
    ContactMethods: { ContactMethods: 'Cards' },
    'about-us': { Numbers: 'KeyFigures' },
  }

  const walkObject = async (
    value: Any,
    fields: Any[] | undefined,
    parentKey?: string
  ): Promise<Any> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value
    const index = fieldIndex(fields)
    const renames = parentKey ? FIELD_RENAMES[parentKey] : undefined
    const out: Any = {}
    for (const [key, val] of Object.entries(value)) {
      const outKey = renames?.[key] ?? key
      out[outKey] = await walkValue(val, index.get(outKey), outKey)
    }
    return out
  }

  /**
   * Rewrites one Strapi value into its Payload equivalent using the real field
   * definition, rather than guessing from the field name.
   *
   * The name-based approach was wrong in two ways that only surface as opaque
   * validation errors:
   *   - `hasMany` uploads (e.g. `inspirations.image`, `hero-banner.Image`) need
   *     an ARRAY of ids, while single uploads need a bare id. The same field
   *     name appears in both shapes across the schema, so the name alone
   *     cannot decide it.
   *   - The postgres adapter uses `serial`, so ids must be NUMBERS. Payload
   *     rejects a string id with "invalid relationships: <id> 0".
   */
  const walkValue = async (
    value: Any,
    def: Any | undefined,
    key?: string
  ): Promise<Any> => {
    if (value === null || value === undefined) return value

    if (def?.type === 'upload') {
      const docs: Any[] = []
      const list = Array.isArray(value) ? value : [value]
      for (const descriptor of list) {
        if (!isMediaDescriptor(descriptor)) continue
        const doc = await ensureMedia(descriptor)
        if (doc) docs.push(doc.id)
      }
      return def.hasMany ? docs : (docs[0] ?? null)
    }

    if (def?.type === 'richText') {
      return typeof value === 'string' ? toRichText(value) : value
    }

    if (def?.type === 'array') {
      if (!Array.isArray(value)) return value
      const out: Any[] = []
      for (const item of value) out.push(await walkObject(item, def.fields, def.name))
      return out
    }

    if (def?.type === 'blocks') {
      if (!Array.isArray(value)) return value
      const out: Any[] = []
      for (const block of value) {
        const blockDef = (def.blocks ?? []).find(
          (b: Any) => b.slug === block?.blockType
        )
        out.push(await walkObject(block, blockDef?.fields ?? def.fields))
      }
      return out
    }

    if (def?.type === 'group') return walkObject(value, def.fields, def.name)

    if (def?.type === 'relationship') {
      // Strapi already stores raw ids here; only the numeric/text shape and
      // hasMany wrapping need enforcing.
      const list = (Array.isArray(value) ? value : [value]).filter(
        (v: Any) => v !== null && v !== undefined
      )
      const ids = list.map((v: Any) =>
        typeof v === 'object' && v !== null ? v.id : v
      )
      return def.hasMany ? ids : (ids[0] ?? null)
    }

    // Leaf field: nothing to rewrite, but a media descriptor can still appear
    // if the Strapi export nested one under an unlisted key.
    if (isMediaDescriptor(value)) {
      const doc = await ensureMedia(value)
      return doc?.id ?? null
    }
    if (Array.isArray(value)) {
      const out: Any[] = []
      for (const item of value) out.push(await walkValue(item, undefined))
      return out
    }
    if (typeof value === 'object') return walkObject(value, undefined, key)
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

  const buildData = async (
    row: Any,
    fields: Any[] | undefined,
    slug: string
  ): Promise<Any> => {
    const index = fieldIndex(fields)
    const renames = FIELD_RENAMES[slug]
    const data: Any = {}
    for (const [key, value] of Object.entries(row)) {
      if (META_KEYS.has(key)) continue
      const outKey = renames?.[key] ?? key
      data[outKey] = await walkValue(value, index.get(outKey), outKey)
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

  /**
   * Payload's top-level `message` is only "The following field is invalid: X";
   * the useful detail (which relationship, which nested path) lives in
   * `err.data.errors`, so fold it into one readable line.
   */
  const describeError = (err: Any): string => {
    const fieldErrors: Any[] = err?.data?.errors
    if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
      return err?.message ?? String(err)
    }
    return fieldErrors
      .map((e: Any) => `${e.path ?? e.label ?? '?'} -> ${e.message}`)
      .join(' | ')
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
    /** Field to match an existing document on; '' for a singleton. */
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
        let data = stripNullIds(
          await buildData(primary, collectionFields(slug), slug)
        )
        if (slug === 'product-variants-colors') data = addBlockTypes(data)
        if (extraData) data = await extraData(primary, data)

        // A singleton has no natural key, so match on the first record.
        const keyValue = keyField ? primary[keyField] : undefined
        const where = keyValue ? { [keyField]: { equals: keyValue } } : {}

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
          let draftData = stripNullIds(
            await buildData(draft, collectionFields(slug), slug)
          )
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
          message: describeError(err),
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
      const data = stripNullIds(
        await buildData(published, globalFields(slug), slug)
      )
      if (!DRY_RUN) {
        await payload.updateGlobal({ slug, data })
      }
      bucket.migrated += 1

      const draft = rows.find((r) => r._status === 'draft')
      if (draft && draft._strapiId !== published._strapiId && !DRY_RUN) {
        const draftData = stripNullIds(
          await buildData(draft, globalFields(slug), slug)
        )
        await payload.updateGlobal({ slug, data: draftData, draft: true })
      }
    } catch (err) {
      bucket.failed += 1
      report.errors.push({ scope: `global:${slug}`, message: describeError(err) })
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
    if (!mediaDocByStrapiId.has(m.strapiId)) await ensureMedia(m)
  }
  console.log(`[migrate] media done: ${JSON.stringify(report.media)}`)

  // 2. blog post categories first — blogs reference them.
  await migrateCollection('blog-post-categories', strapi.blogPostCategories, 'Slug')

  const categoryIdByStrapiRowId = new Map<number, Any>()
  for (const row of strapi.blogPostCategories) {
    // The export capitalises attribute names, so the lookup key is `Slug`.
    const where = row.Slug
      ? { Slug: { equals: row.Slug } }
      : { id: { equals: row._strapiId } }
    const doc = await findExisting('blog-post-categories', where)
    if (doc) categoryIdByStrapiRowId.set(row._strapiId, doc.id)
  }

  // 3. blogs, with their category relation
  await migrateCollection('blogs', strapi.blogs, 'Slug', async (row, data) => {
    const links = strapi.relations.blogsCategories.filter(
      (l: Any) => l.blog_id === row._strapiId
    )
    const ids = links
      .map((l: Any) => categoryIdByStrapiRowId.get(l.blog_post_category_id))
      .filter(Boolean) as Any[]

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

  // 4. remaining collections. about-us is a Strapi single type modelled as a
  // singleton Payload collection (see src/payload/collections/AboutUs.ts).
  await migrateCollection('collections', strapi.collections, 'Handle')
  await migrateCollection('categories', strapi.categories, 'handle')
  await migrateCollection('inspirations', strapi.inspirations, 'title')
  await migrateCollection(
    'product-variants-colors',
    strapi.productVariantColors,
    'Name'
  )
  await migrateCollection('about-us', strapi.globals.aboutUs, '')

  // 5. globals
  await migrateGlobal('homepage', strapi.globals.homepage)
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
