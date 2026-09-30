import path from 'path'

import dotenv from 'dotenv'

/**
 * Creates the first Payload admin user so the CMS admin is usable.
 *
 * Credentials come from the environment, never from source:
 *   PAYLOAD_ADMIN_EMAIL, PAYLOAD_ADMIN_PASSWORD
 *
 * If the user already exists the password is reset to the supplied one, which
 * makes the script safe to re-run after a schema reset. An existing account is
 * never silently skipped, because a forgotten password locks everyone out of
 * the CMS and there is no other way in.
 *
 *   npx esbuild src/scripts/create-admin-user.ts --bundle --platform=node \
 *     --format=esm --packages=external --target=node20 --outfile=.create-admin.mjs
 *   node .create-admin.mjs
 */
async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  const email = process.env.PAYLOAD_ADMIN_EMAIL
  const password = process.env.PAYLOAD_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env before running.'
    )
  }

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password },
    })
    console.log(`[admin] password reset for ${email}`)
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password },
    })
    console.log(`[admin] created ${email}`)
  }

  const total = await payload.find({ collection: 'users', limit: 10, depth: 0 })
  console.log(`[admin] users: ${total.totalDocs}`)

  await payload.destroy()
  process.exit(0)
}

main().catch((err) => {
  console.error('[admin] FAILED:', err)
  process.exit(1)
})
