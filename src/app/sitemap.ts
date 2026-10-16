import { MetadataRoute } from 'next'

import { sdk } from '@lib/config'
import { getAllBlogSlugs } from '@lib/data/cms'
import { getCollectionsList } from '@lib/data/collections'
import { listCategories } from '@lib/data/categories'
import { getBaseURL } from '@lib/util/env'
import { HttpTypes } from '@medusajs/types'

/**
 * Storefront sitemap — submit `<origin>/sitemap.xml` to Google Search Console.
 *
 * Every storefront route is country-scoped (`/{countryCode}/…`) and this shop
 * ships a single locale (`ma`), so entries are built once against it.
 *
 * Two rules shape this file:
 *
 *   1. Base URL comes from `getBaseURL()` — the same helper `metadataBase`,
 *      canonical tags and JSON-LD use — so the sitemap never advertises a
 *      different host than the pages themselves. Hardcoding a fallback here was
 *      how it ended up claiming a domain that was not even the live one.
 *   2. Each section is fetched independently and degrades to an empty list.
 *      A hung Medusa instance or a broken CMS collection must not turn the
 *      sitemap into a 500 — Google reacts to a failing sitemap by dropping
 *      the whole file, not just the missing URLs.
 */

/** The only locale this storefront renders. */
const COUNTRY_CODE = 'ma'

const baseUrl = getBaseURL()

const url = (path: string) =>
  path ? `${baseUrl}/${COUNTRY_CODE}/${path}` : `${baseUrl}/${COUNTRY_CODE}`

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]['changeFrequency']
>

/** Public, indexable marketing/legal routes. Private areas (cart, account,
 *  checkout, password reset, search results) are deliberately absent. */
const STATIC_PAGES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: 'categories', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'collections', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'shop', priority: 0.8, changeFrequency: 'daily' },
  { path: 'blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: 'faq', priority: 0.4, changeFrequency: 'monthly' },
  { path: 'about-us', priority: 0.4, changeFrequency: 'yearly' },
  { path: 'contact-us', priority: 0.4, changeFrequency: 'yearly' },
  { path: 'privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: 'terms-and-conditions', priority: 0.2, changeFrequency: 'yearly' },
]

const PRODUCT_PAGE_SIZE = 100
/** Hard stop so a pathological catalogue can never spin forever. */
const MAX_PRODUCT_PAGES = 100

/**
 * Product URLs.
 *
 * Deliberately does not reuse `getProductsList`: that helper calls `noStore()`,
 * which would force this route to render dynamically on every crawl. The
 * sitemap only needs handles, so the listing is paged straight from the SDK
 * and tag-cached instead, like the rest of the data layer.
 */
async function getProductEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const seen = new Set<string>()
  let offset = 0
  let total = 0

  do {
    const { products, count } = await sdk.store.product.list(
      { limit: PRODUCT_PAGE_SIZE, offset },
      // Tag-cached like the rest of the data layer (see the revalidate route);
      // Medusa's SDK option type only declares `tags`, not `revalidate`.
      { next: { tags: ['products'] } }
    )

    total = count

    for (const product of products) {
      if (!product.handle || seen.has(product.handle)) continue
      seen.add(product.handle)

      entries.push({
        url: url(`products/${product.handle}`),
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    offset += PRODUCT_PAGE_SIZE
  } while (offset < total && seen.size < MAX_PRODUCT_PAGES * PRODUCT_PAGE_SIZE)

  return entries
}

async function getCollectionEntries(): Promise<MetadataRoute.Sitemap> {
  const { collections } = await getCollectionsList()

  return collections
    .filter((collection) => Boolean(collection.handle))
    .map((collection) => ({
      url: url(`collections/${collection.handle}`),
      lastModified: new Date(collection.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
}

/** The category route is a `[...category]` catch-all, so a nested category's
 *  URL is its full handle chain from the root down: `/categories/a/b`. */
function categoryPath(category: HttpTypes.StoreProductCategory): string {
  const chain: string[] = []
  const seen = new Set<string>()
  let node: HttpTypes.StoreProductCategory | string | null | undefined =
    category

  while (node && typeof node === 'object' && node.handle && !seen.has(node.id)) {
    seen.add(node.id)
    chain.unshift(node.handle)
    node = node.parent_category
  }

  return chain.join('/')
}

async function getCategoryEntries(): Promise<MetadataRoute.Sitemap> {
  const categories = await listCategories().catch(
    () => [] as HttpTypes.StoreProductCategory[]
  )

  const entries: MetadataRoute.Sitemap = []

  for (const category of categories) {
    const path = categoryPath(category)
    if (!path) continue

    entries.push({
      url: url(`categories/${path}`),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  return entries
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productEntries, collectionEntries, categoryEntries, blogSlugs] =
    await Promise.all([
      getProductEntries().catch(() => []),
      getCollectionEntries().catch(() => []),
      getCategoryEntries().catch(() => []),
      getAllBlogSlugs().catch(() => [] as string[]),
    ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: url(page.path),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: url(`blog/${slug}`),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    ...staticEntries,
    ...productEntries,
    ...collectionEntries,
    ...categoryEntries,
    ...blogEntries,
  ]
}
