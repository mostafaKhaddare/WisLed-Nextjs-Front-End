import path from 'path'

import dotenv from 'dotenv'

/**
 * Connects Payload once and prints the resulting config.
 *
 * Because NODE_ENV is not "production" here, Payload syncs the schema to the
 * database on init (its `push` behaviour), which is what creates the tables
 * for a brand new database.
 *
 * The config is imported dynamically on purpose: payload.config.ts reads
 * PAYLOAD_SECRET at module-evaluation time, so it must not be hoisted above
 * the dotenv.config() call below.
 */
async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })
  console.log('[init] payload connected')

  console.log(
    '[init] collections:',
    payload.config.collections.map((c: { slug: string }) => c.slug).join(', ')
  )
  console.log(
    '[init] globals    :',
    payload.config.globals.map((g: { slug: string }) => g.slug).join(', ')
  )

  await payload.destroy()
  process.exit(0)
}

main().catch((err) => {
  console.error('[init] FAILED:', err)
  process.exit(1)
})
