import { notFound } from 'next/navigation'

import { getAllBlogSlugs, getBlogPostBySlug, getBlogPosts } from '@lib/data/cms'
import { getProductsList } from '@lib/data/products'
import { listRegions } from '@lib/data/regions'
import { StoreRegion } from '@medusajs/types'
import BlogPostTemplate from '@modules/blog/templates/blogPostTemplate'

export async function generateStaticParams() {
  try {
    const slugs = await getAllBlogSlugs()

    if (!slugs?.length) {
      return []
    }

    const countryCodes = await listRegions()
      .then((regions: StoreRegion[]) =>
        regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
      )
      .catch(() => [])

    return slugs.flatMap((slug) =>
      (countryCodes ?? []).map((countryCode) => ({
        slug,
        countryCode,
      }))
    )
  } catch {
    return []
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string; countryCode: string }> }) {
  const params = await props.params
  const article = await getBlogPostBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Introuvable | Wisled',
    }
  }

  return {
    title: article.Title,
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const params = await props.params
  const { slug, countryCode } = params
  const article = await getBlogPostBySlug(slug)

  if (!article) {
    notFound()
  }

  const [allPosts, { response: { products: recommendedProducts } }] = await Promise.all([
    getBlogPosts({ sortBy: '-createdAt' }),
    getProductsList({
      pageParam: 0,
      queryParams: { limit: 6 },
      countryCode,
    }).catch(() => ({ response: { products: [] } })),
  ])

  // Find current post index for prev/next navigation
  const allArticles = allPosts?.data ?? []
  const currentIndex = allArticles.findIndex((p) => p.Slug === slug)
  const prevPost = currentIndex > 0 ? allArticles[currentIndex - 1] : null
  const nextPost =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null

  // Related articles: same category or same index neighbors
  const relatedArticles = allArticles
    .filter((p) => p.Slug !== slug)
    .slice(0, 4)

  return (
    <BlogPostTemplate
      article={article}
      countryCode={countryCode}
      prevPost={prevPost}
      nextPost={nextPost}
      relatedArticles={relatedArticles}
      recommendedProducts={recommendedProducts}
    />
  )
}
