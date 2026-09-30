import path from 'path'

import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function main(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  console.log('--- blogs -> Categories ---')
  const blogs = await payload.find({ collection: 'blogs', limit: 50, depth: 2 })
  for (const b of blogs.docs as any[]) {
    const cats = (b.Categories ?? []).map((c: any) => c?.Slug ?? c)
    console.log(`  ${String(b.Slug).slice(0, 55).padEnd(56)} cats=${JSON.stringify(cats)}`)
  }

  console.log('\n--- blog post categories ---')
  const bpcs = await payload.find({ collection: 'blog-post-categories', limit: 50 })
  for (const c of bpcs.docs as any[]) console.log(`  id=${c.id} ${c.Slug}`)

  console.log('\n--- inspirations hotspots ---')
  const insp = await payload.find({ collection: 'inspirations', limit: 50, depth: 1 })
  for (const i of insp.docs as any[]) {
    console.log(
      `  ${String(i.title).slice(0, 30).padEnd(31)} images=${i.image?.length ?? 0} hotspots=${i.hotspots?.length ?? 0}` +
        (i.hotspots?.[0] ? ` handle=${i.hotspots[0].product_handle}` : '')
    )
  }

  console.log('\n--- product variant colors ---')
  const pvc = await payload.find({ collection: 'product-variants-colors', limit: 50, depth: 1 })
  for (const p of pvc.docs as any[]) {
    console.log(`  ${String(p.Name).padEnd(24)} blocks=${JSON.stringify((p.Type ?? []).map((b: any) => b.blockType))}`)
  }

  await payload.destroy()
  process.exit(0)
}

main().catch((e) => {
  console.error('FAILED', e)
  process.exit(1)
})
