import path from 'path'

import dotenv from 'dotenv'

/**
 * Creates and runs the versioned Postgres migrations for the Payload schema.
 *
 * This is the replacement for the dev-only `push` behaviour and the path
 * production must use:
 *   npx esbuild src/scripts/payload-migrate.ts --bundle --platform=node \
 *     --format=esm --packages=external --target=node20 --outfile=.payload-migrate-schema.mjs
 *   node .payload-migrate-schema.mjs            # write + apply
 *   node .payload-migrate-schema.mjs --status   # show pending migrations
 *
 * The `payload` CLI is not used because it crashes on this Node version
 * (undici `Illegal constructor` while initialising CacheStorage); the adapter
 * exposes the same operations programmatically.
 */
async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const db = payload.db as any

  if (process.argv.includes('--status')) {
    const status = await db.migrateStatus()
    console.log('[migrate] status:', JSON.stringify(status, null, 2))
    await payload.destroy()
    process.exit(0)
  }

  if (process.argv.includes('--fresh')) {
    console.log('[migrate] resetting database')
    await db.migrateFresh()
  } else {
    console.log('[migrate] writing migration')
    await db.createMigration({
      payload,
      migrationName: process.env.MIGRATION_NAME ?? 'initial',
      forceAcceptWarning: true,
    })
    console.log('[migrate] applying migrations')
    await db.migrate()
  }

  const tables = await db.drizzle.execute(
    `select tablename from pg_tables where schemaname = 'public' order by tablename`
  )
  console.log(`[migrate] tables now: ${(tables as any).rows.length}`)

  await payload.destroy()
  process.exit(0)
}

main().catch((err) => {
  console.error('[migrate] FAILED:', err)
  process.exit(1)
})
