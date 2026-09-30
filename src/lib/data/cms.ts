import { unstable_cache } from 'next/cache'

import { convertLexicalToMarkdown } from '@payloadcms/richtext-lexical'

import { getCmsClient } from '@lib/payload/client'

import type { Inspiration as InspirationEntry } from '@lib/data/strapi'
import type {
  AboutUsData,
  BlogData,
  BlogPost,
  CategoriesData,
  CollectionsData,
  ContentPageData,
  FAQData,
  HeroBannerData,
  MidBannerData,
  VariantColorData,
} from 'types/strapi'

/**
 * Payload-backed CMS data layer.
 *
 * This is a drop-in replacement for src/lib/data/fetch.ts (the Strapi
 * fetcher). Every export keeps the same name, arguments and return shape, so
 * switching a consumer over is an import-path change only.
 *
 * Return types come from `types/strapi` on purpose: that is the contract every
 * page and component already consumes, so consumers typecheck unchanged. The
 * values behind it are Payload documents, which are flat rather than nested
 * under `attributes`; `getAttributes()` in src/lib/data/strapi.ts already
 * accepts both shapes. Payload ids are strings and Strapi's were numbers, but
 * nothing reads them as anything but a React key. The Strapi-only fields
 * (`documentId`, `publishedAt`, `locale`) are not read anywhere.
 *
 * Caching: Strapi went over HTTP and used Next's fetch data cache keyed by
 * `next.tags`. Payload uses the local API, which bypasses that cache
 * entirely, so the same tags are re-applied explicitly with
 * `unstable_cache`. That keeps ISR behaviour and keeps
 * src/app/api/revalidate/route.ts working unchanged during the transition.
 *
 * Reads are draft-free on purpose: `payload.find` defaults to
 * `draft: false`, so unpublished content never reaches the storefront — the
 * same guarantee the Strapi draftAndPublish setup gave.
 */

type Any = any

type InspirationsData = { data: InspirationEntry[] }

/** Narrow a string to a known global slug; returns null when unrecognised. */
const CONTENT_PAGE_GLOBALS: Record<string, string> = {
  'privacy-policy': 'privacy-policy',
  'privacy_policies': 'privacy-policy',
  'terms-and-condition': 'terms-and-condition',
  'terms-and-conditions': 'terms-and-condition',
  'terms_and_conditions': 'terms-and-condition',
}

/* ─────────────────────────────────────────────
   Homepage
   ───────────────────────────────────────────── */
const FALLBACK_HERO = {
  Headline: 'Solutions LED Premium',
  Text: "Découvrez notre gamme complète d'éclairage LED haute performance pour tous vos projets.",
  CTA: { BtnText: 'Voir la boutique', BtnLink: '/shop' },
  Image: null,
}

export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const homepage = await payload.findGlobal({ slug: 'homepage', depth: 2 })
      return { data: { HeroBanner: (homepage as Any).HeroBanner } }
    },
    ['cms-homepage-hero'],
    { tags: ['hero-banner'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getHeroBannerData failed:', (err as Error).message)
    return { data: { HeroBanner: FALLBACK_HERO } } as HeroBannerData
  }
}

export const getMidBannerData = async (): Promise<MidBannerData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const homepage = await payload.findGlobal({ slug: 'homepage', depth: 2 })
      return { data: { MidBanner: (homepage as Any).MidBanner } }
    },
    ['cms-homepage-mid'],
    { tags: ['mid-banner'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getMidBannerData failed:', (err as Error).message)
    return { data: { MidBanner: null } } as unknown as MidBannerData
  }
}

/* ─────────────────────────────────────────────
   Collections / Categories
   ───────────────────────────────────────────── */
export const getCollectionsData = async (): Promise<CollectionsData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'collections',
        depth: 2,
        limit: 1000,
        sort: '-createdAt',
      })
      return { data: result.docs as Any[] }
    },
    ['cms-collections'],
    { tags: ['collections-main'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getCollectionsData failed:', (err as Error).message)
    return { data: [] }
  }
}

export const getCategoriesData = async (): Promise<CategoriesData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'categories',
        depth: 2,
        limit: 1000,
        sort: '-createdAt',
      })
      return { data: result.docs as Any[] }
    },
    ['cms-categories'],
    { tags: ['collections-main'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getCategoriesData failed:', (err as Error).message)
    return { data: [] }
  }
}

/* ─────────────────────────────────────────────
   Blog
   ───────────────────────────────────────────── */
const BLOG_POPULATE = { FeaturedImage: true, Categories: true } as const

/**
 * Payload stores bodies as Lexical editor state; the storefront renders them
 * with react-markdown (src/modules/blog/components/blog-content) and splits
 * them on headings to build the table of contents. Convert back to markdown at
 * the data boundary so those components keep working exactly as they did
 * against Strapi, and so the round-trip through
 * `convertMarkdownToLexical` in the migration is lossless.
 *
 * The blog-post-category rows have no body, so this is a no-op for them.
 */
const richTextToMarkdown = (payload: Any, value: unknown): string => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return convertLexicalToMarkdown({
      data: value as Any,
      editorConfig: (payload.config.editor as Any).editorConfig,
    })
  } catch (err) {
    console.error('[cms] rich text conversion failed:', (err as Error).message)
    return ''
  }
}

const toBlogData = (
  payload: Any,
  docs: Any[],
  pageSize: number
): BlogData => ({
  data: docs.map((doc) => ({
    ...doc,
    Content: richTextToMarkdown(payload, doc.Content),
  })),
  meta: {
    pagination: {
      page: 1,
      pageSize,
      pageCount: docs.length ? 1 : 0,
      total: docs.length,
    },
  },
})

export const getExploreBlogData = async (): Promise<BlogData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'blogs',
        depth: 2,
        limit: 3,
        sort: '-createdAt',
        populate: BLOG_POPULATE as Any,
      })
      return toBlogData(payload, result.docs as Any[], 3)
    },
    ['cms-blog-explore'],
    { tags: ['explore-blog'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getExploreBlogData failed:', (err as Error).message)
    return toBlogData(null, [], 3)
  }
}

export const getBlogPosts = async ({
  sortBy = '-createdAt',
  query: search,
  category,
}: {
  sortBy?: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  const where: Any = {}
  if (search) where.Title = { like: search }
  if (category) where.Categories = { Slug: { equals: category } }

  // Cache key must vary with the filters, so fold them into the keyParts.
  const cached = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'blogs',
        depth: 2,
        limit: 1000,
        sort: sortBy as Any,
        where,
        populate: BLOG_POPULATE as Any,
      })
      return toBlogData(payload, result.docs as Any[], 1000)
    },
    ['cms-blog-list', sortBy, search ?? '', category ?? ''],
    { tags: ['blog'] }
  )

  try {
    return await cached()
  } catch (err) {
    console.error('[cms] getBlogPosts failed:', (err as Error).message)
    return toBlogData(null, [], 0)
  }
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'blog-post-categories',
        depth: 0,
        limit: 100,
        sort: '-createdAt',
      })
      return toBlogData(payload, result.docs as Any[], 100)
    },
    ['cms-blog-categories'],
    { tags: ['blog-categories'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getBlogPostCategories failed:', (err as Error).message)
    return toBlogData(null, [], 0)
  }
}

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'blogs',
        depth: 2,
        limit: 1,
        where: { Slug: { equals: slug } },
        populate: BLOG_POPULATE as Any,
      })
      const doc = result.docs[0] as Any
      if (!doc) return null
      return { ...doc, Content: richTextToMarkdown(payload, doc.Content) }
    },
    ['cms-blog-post', slug],
    { tags: ['blog', `blog-${slug}`] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getBlogPostBySlug failed:', (err as Error).message)
    return null
  }
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'blogs',
        depth: 0,
        limit: 1000,
        sort: '-createdAt',
      })
      return (result.docs as Any[])
        .map((post) => post.Slug)
        .filter(Boolean) as string[]
    },
    ['cms-blog-slugs'],
    { tags: ['blog-slugs'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getAllBlogSlugs failed:', (err as Error).message)
    return []
  }
}

/* ─────────────────────────────────────────────
   Variant colours
   ───────────────────────────────────────────── */
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'product-variants-colors',
        depth: 2,
        limit: 100,
      })
      return { data: result.docs as Any[] }
    },
    ['cms-variant-colors'],
    { tags: ['variants-colors'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getProductVariantsColors failed:', (err as Error).message)
    return { data: [] }
  }
}

/* ─────────────────────────────────────────────
   About Us / Contact Us / FAQ
   ───────────────────────────────────────────── */
/**
 * About Us is a single record in a collection, not a global, so that the
 * postgres adapter can relate its arrays — see src/payload/collections/AboutUs.ts.
 *
 * `KeyFigures` is stored under that name to avoid clashing with Payload's
 * reserved `_numbers` localization table suffix; it is mapped back to Strapi's
 * `Numbers` here so the frontend contract is unchanged.
 */
export const getAboutUs = async (): Promise<AboutUsData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'about-us',
        depth: 2,
        limit: 1,
        draft: true,
      })
      const doc = result.docs[0] as Any
      if (!doc) return { data: {} }

      const { KeyFigures, ...rest } = doc
      return { data: { ...rest, Numbers: KeyFigures ?? [] } as Any }
    },
    ['cms-about-us'],
    { tags: ['about-us'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getAboutUs failed:', (err as Error).message)
    return { data: {} } as unknown as AboutUsData
  }
}

/**
 * The inner contact-grid repeatable is stored as `Cards`: it repeats its own
 * parent array name, which drizzle refuses to model. Mapped back to
 * `ContactMethods` so the frontend contract is unchanged.
 */
export const getContactUs = async () => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const data = await payload.findGlobal({ slug: 'contact-us', depth: 2 })
      const contact = data as Any
      const grids = (contact?.ContactMethods ?? []).map((grid: Any) =>
        grid?.Cards ? { ...grid, ContactMethods: grid.Cards } : grid
      )
      return { data: { ...contact, ContactMethods: grids } as Any }
    },
    ['cms-contact-us'],
    { tags: ['contact-us'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getContactUs failed:', (err as Error).message)
    return {
      data: {
        Header: [
          {
            Title: 'Contactez-nous',
            Text: "Notre équipe est là pour répondre à toutes vos questions sur nos solutions d'éclairage LED.",
            Image: null,
          },
        ],
        ContactMethods: [
          {
            Title: 'Contact',
            ContactMethods: [
              { Title: 'Email', Text: 'info@wisled.ma', Link: 'mailto:info@wisled.ma' },
              { Title: 'Téléphone / WhatsApp', Text: '+212 710 420 420', Link: 'https://wa.me/212710420420' },
              { Title: 'Adresse', Text: 'Maroc', Link: null },
            ],
          },
        ],
        FormIntro: [
          {
            BtnText: 'Parlons de votre projet',
            BtnLink: '/contact-us',
          },
        ],
      },
    }
  }
}

export const getFAQ = async (): Promise<FAQData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const data = await payload.findGlobal({ slug: 'faq', depth: 2 })
      return { data: data as Any }
    },
    ['cms-faq'],
    { tags: ['faq'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getFAQ failed:', (err as Error).message)
    return { data: { FAQSection: [] } } as unknown as FAQData
  }
}

/* ─────────────────────────────────────────────
   Content pages (Privacy, Terms)
   ───────────────────────────────────────────── */
export const getContentPage = async (
  type: string,
  _tag?: string
): Promise<ContentPageData> => {
  const globalSlug = CONTENT_PAGE_GLOBALS[type] ?? type

  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const data = await payload.findGlobal({ slug: globalSlug, depth: 1 })
      const page = data as Any
      return {
        data: {
          ...page,
          PageContent: richTextToMarkdown(payload, page.PageContent),
        } as Any,
      }
    },
    ['cms-content-page', globalSlug],
    { tags: [globalSlug] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getContentPage failed:', (err as Error).message)
    return { data: { id: '', PageContent: null } } as unknown as ContentPageData
  }
}

/* ─────────────────────────────────────────────
   Inspirations
   ───────────────────────────────────────────── */
export const getInspirationsData = async (): Promise<InspirationsData> => {
  const query = unstable_cache(
    async () => {
      const payload = await getCmsClient()
      const result = await payload.find({
        collection: 'inspirations',
        depth: 2,
        limit: 1000,
        sort: '-createdAt',
      })
      return { data: result.docs as Any[] }
    },
    ['cms-inspirations'],
    { tags: ['inspirations'] }
  )

  try {
    return await query()
  } catch (err) {
    console.error('[cms] getInspirationsData failed:', (err as Error).message)
    return { data: [] }
  }
}
