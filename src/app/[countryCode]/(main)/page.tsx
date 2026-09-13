import { Suspense } from 'react'
import { Metadata } from 'next'

import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getBestSellers } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import {
  getCollectionsData,
  getExploreBlogData,
  getHeroBannerData,
  getMidBannerData,
  getInspirationsData,
} from '@lib/data/fetch'
import { CategoryCarousel } from '@modules/categories/components/category-carousel'
import { Banner } from '@modules/home/components/banner'
import Collections from '@modules/home/components/collections'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import Hero from '@modules/home/components/hero'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import SkeletonCategoriesCarousel from '@modules/skeletons/templates/skeleton-categories-carousel'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import LookbookSection from '@modules/home/components/lookbook/LookbookSection'
import OrganizationJsonLd from '@modules/seo/components/organization-json-ld'

export const metadata: Metadata = {
  title: 'Wisled | Expert en Solutions d’Éclairage LED et Contrôle',
  description:
    'Découvrez Wisled, votre boutique spécialisée en éclairage LED haute performance et systèmes de contrôle avancés (DMX, SPI). Qualité et innovation pour tous vos projets.',
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [categories, { collections: collectionsList }, bestSellers] =
    await Promise.all([
      listCategories(),
      getCollectionsList(),
      getBestSellers({
        countryCode: countryCode,
        limit: 12,
      }),
    ])

  const region = await getRegion(countryCode)

  if (!bestSellers || !collectionsList || !region) {
    return null
  }

  // CMS data — all Strapi calls are safe (return null on failure, never throw)
  const [
    strapiCollections,
    heroBannerResult,
    midBannerResult,
    blogResult,
    inspirationsData,
  ] = await Promise.all([
    getCollectionsData(),
    getHeroBannerData(),
    getMidBannerData(),
    getExploreBlogData(),
    getInspirationsData(),
  ])

  const HeroBanner = heroBannerResult?.data?.HeroBanner ?? null
  const MidBanner = midBannerResult?.data?.MidBanner ?? null
  const posts = blogResult?.data ?? []


  return (
    <>
      <OrganizationJsonLd />
      {/* Hero: always rendered — falls back to CSS gradient when Strapi is offline */}
      {HeroBanner && <Hero data={HeroBanner} />}



      <Suspense fallback={<SkeletonCategoriesCarousel />}>
        <CategoryCarousel
          testId="our-bestsellers-section"
          categories={categories}
          title="Achetez par catégorie"
          viewAll={{
            link: '/categories',
            text: 'Afficher tout',
          }}
        />
      </Suspense>


      {strapiCollections && (
        <Collections
          cmsCollections={strapiCollections}
          medusaCollections={collectionsList}
        />
      )}
      {/* SHOP THE LOOK SECTION */}
      <LookbookSection regionId={region.id} inspirations={inspirationsData?.data || []} />
      <Suspense fallback={<SkeletonProductsCarousel />}>
        <ProductCarousel
          testId="our-bestsellers-section"
          products={bestSellers}
          regionId={region.id}
          title="Nos meilleures ventes"
          viewAll={{
            link: '/categories',
            text: 'Afficher tout',
          }}
        />
      </Suspense>

      {/* MidBanner: only render if image exists (Banner component requires it) */}
      {MidBanner && MidBanner.Image && <Banner data={MidBanner} />}
      {/* ------------------------------------------------ */}
      {posts && posts.length > 0 && <ExploreBlog posts={posts} />}
    </>
  )
}
