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
} from '@lib/data/cms'
import { CategoryCarousel } from '@modules/categories/components/category-carousel'
import Collections from '@modules/home/components/collections'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import Hero from '@modules/home/components/hero'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import SkeletonCategoriesCarousel from '@modules/skeletons/templates/skeleton-categories-carousel'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import LookbookSection from '@modules/home/components/lookbook/LookbookSection'
import InnovationCard from '@modules/home/components/innovation'
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

  // Medusa (catalog) and Payload (CMS) are fetched together so a slow or
  // offline backend costs one round trip, not two. Every Medusa call is
  // bounded by the shared request timeout and degrades on its own — empty
  // lists and a null region — so the Payload sections below still render
  // while the catalog is offline.
  const [
    categories,
    { collections: collectionsList },
    bestSellers,
    region,
    strapiCollections,
    heroBannerResult,
    midBannerResult,
    blogResult,
    inspirationsData,
  ] = await Promise.all([
    listCategories(),
    getCollectionsList(),
    getBestSellers({ countryCode, limit: 12 }),
    getRegion(countryCode),
    getCollectionsData(),
    getHeroBannerData(),
    getMidBannerData(),
    getExploreBlogData(),
    getInspirationsData(),
  ])

  const HeroBanner = heroBannerResult?.data?.HeroBanner ?? null
  const MidBanner = midBannerResult?.data?.MidBanner ?? null
  const posts = blogResult?.data ?? []

  // Photo for the "À propos" panel. The mid banner is the first real lighting
  // photo available on the page; the first post's featured image is the second
  // choice, and with neither the panel falls back to its navy wash.
  const aboutPhoto =
    (Array.isArray(MidBanner?.Image) ? MidBanner.Image[0] : MidBanner?.Image) ??
    posts[0]?.FeaturedImage ??
    (Array.isArray(HeroBanner?.Image) ? HeroBanner.Image[0] : HeroBanner?.Image) ??
    null


  // Sections that price or link products need a region; without one
  // (backend offline) they are skipped rather than breaking the page.
  const regionId = region?.id

  return (
    <>
      <OrganizationJsonLd />
      {/* Hero: always rendered — falls back to CSS gradient when Strapi is offline */}
      {HeroBanner && <Hero data={HeroBanner} />}



      {categories && categories.length > 0 && (
        <Suspense fallback={<SkeletonCategoriesCarousel />}>
          <CategoryCarousel
            testId="our-bestsellers-section"
            categories={categories}
            title="Achetez par catégorie"
            headingDescription="Trouvez les solutions d'éclairage LED adaptées à votre projet"
            initialLimit={20}
            viewAll={{
              link: '/categories',
              text: 'Afficher tout',
            }}
          />
        </Suspense>
      )}


      {strapiCollections && (
        <Collections
          cmsCollections={strapiCollections}
          medusaCollections={collectionsList}
          headingDescription="Explorez nos collections thématiques pour chaque besoin d'éclairage"
        />
      )}
      {/* SHOP THE LOOK SECTION — needs a region to price products */}
      {regionId && (
        <LookbookSection
          regionId={regionId}
          inspirations={inspirationsData?.data || []}
        />
      )}
      {regionId && bestSellers && bestSellers.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            testId="our-bestsellers-section"
            products={bestSellers}
            regionId={regionId}
            title="Nos meilleures ventes"
            viewAll={{
              link: '/categories',
              text: 'Afficher tout',
            }}
          />
        </Suspense>
      )}

      {/* "À propos / Innovation & Design" panel, sits above the news block. */}
      <InnovationCard image={aboutPhoto} />

      {/* ------------------------------------------------ */}
      {posts && posts.length > 0 && <ExploreBlog posts={posts} />}
    </>
  )
}
