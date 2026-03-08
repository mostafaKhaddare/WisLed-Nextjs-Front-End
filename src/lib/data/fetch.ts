import {
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

/* ─────────────────────────────────────────────
   Core fetcher – throws on HTTP error (kept for backward compat)
   ───────────────────────────────────────────── */
export const fetchStrapiClient = async (
  endpoint: string,
  params?: RequestInit
) => {
  const token = process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`,
    {
      headers,
      ...params,
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
  }

  return response
}

/**
 * Safe wrapper: catches any network/HTTP error and returns null.
 * If a token is set but expired (401), automatically retries without auth
 * since Strapi may have public read permissions enabled.
 */
async function safeFetch(
  endpoint: string,
  params?: RequestInit
): Promise<Response | null> {
  try {
    return await fetchStrapiClient(endpoint, params)
  } catch (err) {
    const msg = (err as Error).message
    // If 401 (expired/invalid token), retry without Authorization header
    if (msg.includes('401')) {
      console.warn(`[Strapi] Token rejected (401) for "${endpoint}", retrying without auth…`)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`,
          params
        )
        if (response.ok) return response
        console.error(`[Strapi] Public retry also failed: ${response.status} for "${endpoint}"`)
        return null
      } catch (retryErr) {
        console.error(`[Strapi] Public retry threw for "${endpoint}":`, (retryErr as Error).message)
        return null
      }
    }
    console.warn(`[Strapi] Fetch failed for "${endpoint}":`, msg)
    return null
  }
}

/* ─────────────────────────────────────────────
   Homepage – HeroBanner
   Fallback: empty data so the page renders a CSS-only hero fallback
   ───────────────────────────────────────────── */
export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  const res = await safeFetch(
    `/api/homepage?populate[HeroBanner][populate]=*`,
    { next: { tags: ['hero-banner'] } }
  )
  if (!res) {
    return {
      data: {
        HeroBanner: {
          Headline: 'Solutions LED Premium',
          Text: "Découvrez notre gamme complète d'éclairage LED haute performance pour tous vos projets.",
          CTA: { id: 1, BtnText: 'Voir la boutique', BtnLink: '/shop' },
          Image: null as any,
        },
      },
    } as HeroBannerData
  }
  return res.json()
}

/* ─────────────────────────────────────────────
   Homepage – MidBanner
   ───────────────────────────────────────────── */
export const getMidBannerData = async (): Promise<MidBannerData> => {
  const res = await safeFetch(
    `/api/homepage?populate[MidBanner][populate]=*`,
    { next: { tags: ['mid-banner'] } }
  )
  if (!res) {
    return {
      data: {
        MidBanner: null as any,
      },
    } as MidBannerData
  }
  return res.json()
}

/* ─────────────────────────────────────────────
   Collections / Categories
   ───────────────────────────────────────────── */
export const getCollectionsData = async (): Promise<CollectionsData> => {
  const res = await safeFetch(`/api/collections?&populate=*`, {
    next: { tags: ['collections-main'] },
  })
  if (!res) return { data: [] } as CollectionsData
  return res.json()
}

export const getCategoriesData = async (): Promise<CategoriesData> => {
  const res = await safeFetch(`/api/categories?&populate=*`, {
    next: { tags: ['collections-main'] },
  })
  if (!res) return { data: [] } as CategoriesData
  return res.json()
}

/* ─────────────────────────────────────────────
   Blog
   ───────────────────────────────────────────── */
export const getExploreBlogData = async (): Promise<BlogData> => {
  const res = await safeFetch(
    `/api/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`,
    { next: { tags: ['explore-blog'] } }
  )
  if (!res) return { data: [], meta: { pagination: { page: 1, pageSize: 3, pageCount: 0, total: 0 } } }
  return res.json()
}

export const getBlogPosts = async ({
  sortBy = 'createdAt:desc',
  query,
  category,
}: {
  sortBy: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  const baseUrl = `/api/blogs?populate[1]=FeaturedImage&populate[2]=Categories&sort=${sortBy}&pagination[limit]=1000`
  let urlWithFilters = baseUrl
  if (query) urlWithFilters += `&filters[Title][$contains]=${query}`
  if (category) urlWithFilters += `&filters[Categories][Slug][$eq]=${category}`

  const res = await safeFetch(urlWithFilters, { next: { tags: ['blog'] } })
  if (!res) return { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } }
  return res.json()
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  const res = await safeFetch(
    `/api/blog-post-categories?sort=createdAt:desc&pagination[limit]=100`,
    { next: { tags: ['blog-categories'] } }
  )
  if (!res) return { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } }
  return res.json()
}

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const res = await safeFetch(
    `/api/blogs?filters[Slug][$eq]=${slug}&populate=*`,
    { next: { tags: [`blog-${slug}`] } }
  )
  if (!res) return null
  const data = await res.json()
  if (data.data && data.data.length > 0) return data.data[0]
  return null
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const res = await safeFetch(`/api/blogs?populate=*`, {
    next: { tags: ['blog-slugs'] },
  })
  if (!res) return []
  const data = await res.json()
  return data.data.map((post: BlogPost) => post.Slug)
}

/* ─────────────────────────────────────────────
   Products
   ───────────────────────────────────────────── */
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const res = await safeFetch(
    `/api/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`,
    { next: { tags: ['variants-colors'] } }
  )
  if (!res) return { data: [] }
  return res.json()
}

/* ─────────────────────────────────────────────
   About Us
   ───────────────────────────────────────────── */
export const getAboutUs = async (): Promise<AboutUsData> => {
  const res = await safeFetch(
    `/api/about-us?populate[1]=Banner&populate[2]=OurStory.Image&populate[3]=OurCraftsmanship.Image&populate[4]=WhyUs.Tile.Image&populate[5]=Numbers`,
    { next: { tags: ['about-us'] } }
  )
  if (!res) return { data: {} } as unknown as AboutUsData
  return res.json()
}

/* ─────────────────────────────────────────────
   Contact Us
   ───────────────────────────────────────────── */
export const getContactUs = async () => {
  const res = await safeFetch(
    `/api/contact-us?populate[Header][populate]=*&populate[ContactMethods][populate]=*&populate[FormIntro][populate]=*`,
    { next: { tags: ['contact-us'] } }
  )
  if (!res) {
    return {
      data: {
        Header: {
          Title: 'Contactez-nous',
          Text: "Notre équipe est là pour répondre à toutes vos questions sur nos solutions d'éclairage LED.",
          Image: null,
        },
        ContactMethods: [
          { Title: 'Email', Text: 'info@wisled.ma', Link: 'mailto:info@wisled.ma' },
          { Title: 'Téléphone / WhatsApp', Text: '+212 710 420 420', Link: 'https://wa.me/212710420420' },
          { Title: 'Adresse', Text: 'Maroc', Link: null },
        ],
        FormIntro: {
          Title: 'Parlons de votre projet',
          Text: 'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.',
        },
      },
    }
  }
  return res.json()
}

/* ─────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────── */
export const getFAQ = async (): Promise<FAQData> => {
  const res = await safeFetch(
    `/api/faq?populate[1]=FAQSection&populate[2]=FAQSection.Question`,
    { next: { tags: ['faq'] } }
  )
  if (!res) return { data: { FAQSection: [] } } as unknown as FAQData
  return res.json()
}

/* ─────────────────────────────────────────────
   Content Pages (Privacy, Terms, etc.)
   ───────────────────────────────────────────── */
export const getContentPage = async (
  type: string,
  tag: string
): Promise<ContentPageData> => {
  const res = await safeFetch(`/api/${type}?populate=*`, {
    next: { tags: [tag] },
  })
  if (!res) return { data: { id: 0, documentId: '', PageContent: '' } } as ContentPageData
  return res.json()
}

/* ─────────────────────────────────────────────
   Inspirations (Lookbook / Shop-the-Look)
   Uses tag-based caching so the Strapi webhook
   can invalidate this instantly via:
     revalidateTag('inspirations')
   ───────────────────────────────────────────── */
export const getInspirationsData = async () => {
  const res = await safeFetch(
    `/api/inspirations?populate=*`,
    { next: { tags: ['inspirations'] } }
  )
  if (!res) return { data: [] }
  return res.json()
}
