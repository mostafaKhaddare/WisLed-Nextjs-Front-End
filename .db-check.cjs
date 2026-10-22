// Throwaway diagnostic: inspect Payload's migration bookkeeping and whether the
// new hero-slides table already exists. Plain CJS + pg so tsx/undici never load.
const fs = require('fs')
const path = require('path')

const env = {}
for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
  if (!m) continue
  let v = m[2].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1)
  }
  env[m[1]] = v
}

const uri =
  env.PAYLOAD_DATABASE_URI || env.DATABASE_URL_UNPOOLED || env.DATABASE_URL

if (!uri) {
  console.log('no database uri in .env')
  process.exit(0)
}

// Never print the secret; only where it points.
try {
  const u = new URL(uri)
  console.log('host:', u.hostname, '| db:', u.pathname.replace(/^\//, ''))
} catch {
  console.log('unparseable uri')
}

const { Client } = require('pg')

;(async () => {
  const client = new Client({ connectionString: uri })
  await client.connect()

  const tables = await client.query(
    "select to_regclass('public.homepage_hero_banner_slides') as slides, to_regclass('public.homepage') as homepage, to_regclass('public.payload_migrations') as migs"
  )
  console.log('tables:', tables.rows[0])

  if (tables.rows[0].migs) {
    const rows = await client.query(
      'select name, batch, updated_at from payload_migrations order by id'
    )
    console.log('applied migrations:')
    for (const r of rows.rows) console.log('  ', r.name, '| batch', r.batch)
    if (!rows.rows.length) console.log('   (none recorded)')
  }

  await client.end()
})().catch((e) => {
  console.error('db error:', e.message)
  process.exit(1)
})
