import path from 'path'

import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const COLLECTIONS = [
  'media',
  'collections',
  'categories',
  'blogs',
  'blog-post-categories',
  'inspirations',
  'product-variants-colors',
  'about-us',
] as const

const GLOBALS = [
  'homepage',
  'contact-us',
  'faq',
  'privacy-policy',
  'terms-and-condition',
] as const

async function main(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  let problems = 0

  for (const slug of COLLECTIONS) {
    const res = await payload.find({
      collection: slug,
      limit: 100,
      depth: 2,
      draft: true,
    })
    const withDrafts = await payload.find({
      collection: slug,
      limit: 100,
      depth: 0,
      draft: true,
    })
    console.log(
      `${slug.padEnd(24)} docs=${String(res.totalDocs).padStart(3)} ` +
        `incl. drafts=${String(withDrafts.totalDocs).padStart(3)}`
    )
  }

  for (const slug of GLOBALS) {
    const g = await payload.findGlobal({ slug, depth: 2 })
    console.log(`${slug.padEnd(24)} OK  keys=[${Object.keys(g as any).join(', ')}]`)
  }

  // Spot-check that media actually resolved to populated documents.
  const insp = await payload.find({ collection: 'inspirations', limit: 1, depth: 2 })
  const one = insp.docs[0] as any
  console.log('\n[spot check] inspiration:', one?.title)
  console.log('  room_type :', one?.room_type)
  console.log('  image     :', Array.isArray(one?.image) ? `${one.image.length} populated` : one?.image)
  console.log(
    '  image[0]  :',
    JSON.stringify(one?.image?.[0] && {
      id: one.image[0].id,
      filename: one.image[0].filename,
      url: one.image[0].url,
    })
  )
  console.log('  hotspots  :', JSON.stringify(one?.hotspots))
  if (!one?.image?.length) problems += 1

  const blog = await payload.find({ collection: 'blogs', limit: 1, depth: 2 })
  const b = blog.docs[0] as any
  console.log('\n[spot check] blog:', b?.Title, '| slug:', b?.Slug)
  console.log('  FeaturedImage:', b?.FeaturedImage?.filename ?? b?.FeaturedImage)
  console.log('  Categories   :', JSON.stringify(b?.Categories))
  console.log('  Content type :', typeof b?.Content, (b?.Content as any)?.root?.type)
  if (!b?.FeaturedImage?.id) problems += 1

  const about = await payload.find({ collection: 'about-us', limit: 1, depth: 2 })
  const a = about.docs[0] as any
  console.log('\n[spot check] about-us keys:', Object.keys(a ?? {}).join(', '))
  console.log('  WhyUs.Title   :', a?.WhyUs?.Title)
  console.log('  WhyUs.Tile    :', a?.WhyUs?.Tile?.length, 'tiles')
  console.log('  OurStory.Title:', a?.OurStory?.Title, '| image:', a?.OurStory?.Image?.filename)
  console.log('  KeyFigures    :', JSON.stringify(a?.KeyFigures))
  console.log('  Banner        :', JSON.stringify(a?.Banner?.map?.((m: any) => m.filename)))
  if (!a?.WhyUs?.Title) problems += 1

  const contact = await payload.findGlobal({ slug: 'contact-us', depth: 2 })
  const c = contact as any
  console.log('\n[spot check] contact-us Header:', c?.Header?.length)
  console.log(
    '  ContactMethods[0].Cards:',
    JSON.stringify(c?.ContactMethods?.[0]?.Cards?.map?.((x: any) => x.Title))
  )

  const faq = await payload.findGlobal({ slug: 'faq', depth: 1 })
  console.log('\n[spot check] faq sections:', (faq as any)?.FAQSection?.length)
  console.log(
    '  section0:',
    JSON.stringify((faq as any)?.FAQSection?.[0] && {
      Title: (faq as any).FAQSection[0].Title,
      Bookmark: (faq as any).FAQSection[0].Bookmark,
      questions: (faq as any).FAQSection[0].Question?.length,
    })
  )

  console.log(`\nproblems: ${problems}`)
  await payload.destroy()
  process.exit(problems > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('FAILED', e)
  process.exit(1)
})
