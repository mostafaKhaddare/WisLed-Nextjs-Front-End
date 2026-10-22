// Throwaway: applies src/migrations/20261016_204719_hero_banner_slides with the
// exact DDL Payload generated, then records it in payload_migrations the same way
// Payload's migrate() runner does (payload.create({ name, batch })).
//
// Plain CJS + pg so it never loads tsx/undici. Safe to delete afterwards.
const fs = require('fs')
const path = require('path')

const NAME = '20261016_204719_hero_banner_slides'
const BATCH = 2

const DDL = [
  `CREATE TABLE "homepage_hero_banner_slides" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer NOT NULL,
    "headline" varchar NOT NULL,
    "text" varchar,
    "btn_text" varchar,
    "btn_link" varchar
  )`,
  `ALTER TABLE "homepage_hero_banner_slides" ADD CONSTRAINT "homepage_hero_banner_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action`,
  `ALTER TABLE "homepage_hero_banner_slides" ADD CONSTRAINT "homepage_hero_banner_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action`,
  `CREATE INDEX "homepage_hero_banner_slides_order_idx" ON "homepage_hero_banner_slides" USING btree ("_order")`,
  `CREATE INDEX "homepage_hero_banner_slides_parent_id_idx" ON "homepage_hero_banner_slides" USING btree ("_parent_id")`,
  `CREATE INDEX "homepage_hero_banner_slides_image_idx" ON "homepage_hero_banner_slides" USING btree ("image_id")`,
]

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

const uri = env.PAYLOAD_DATABASE_URI || env.DATABASE_URL_UNPOOLED || env.DATABASE_URL
const { Client } = require('pg')

;(async () => {
  const client = new Client({ connectionString: uri })
  await client.connect()
  try {
    const pre = await client.query(
      `select to_regclass('public.homepage_hero_banner_slides') as tbl,
              (select count(*) from payload_migrations where name = $1) as rec`,
      [NAME]
    )
    console.log('before:', pre.rows[0])
    if (pre.rows[0].tbl) throw new Error('table already exists - refusing to run')
    if (Number(pre.rows[0].rec) > 0) throw new Error('migration already recorded - refusing to run')

    await client.query('BEGIN')
    for (const stmt of DDL) await client.query(stmt)
    await client.query('INSERT INTO payload_migrations (name, batch) VALUES ($1, $2)', [
      NAME,
      BATCH,
    ])
    await client.query('COMMIT')
    console.log('committed')

    const post = await client.query(
      `select to_regclass('public.homepage_hero_banner_slides') as tbl,
              (select count(*) from payload_migrations where name = $1) as rec`,
      [NAME]
    )
    console.log('after:', post.rows[0])

    const cols = await client.query(
      `select column_name, data_type, is_nullable
         from information_schema.columns
        where table_name = 'homepage_hero_banner_slides'
        order by ordinal_position`
    )
    console.log('columns:', cols.rows.map((c) => c.column_name).join(', '))

    const migs = await client.query('select name, batch from payload_migrations order by id')
    console.log('recorded migrations:', migs.rows.map((r) => `${r.name}@${r.batch}`).join(' | '))
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('FAILED:', e.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
})()
