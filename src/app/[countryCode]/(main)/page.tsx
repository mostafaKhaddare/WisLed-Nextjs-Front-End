import { Suspense } from 'react'
import { Metadata } from 'next'

import { listCategories } from '@lib/data/categories'
import {  getCollectionsList } from '@lib/data/collections'
// cms import
import {
  getCollectionsData,
  getExploreBlogData,
  getHeroBannerData,
  getMidBannerData,
} from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { CategoryCarousel } from '@modules/categories/components/category-carousel'
import { Banner } from '@modules/home/components/banner'
import Collections from '@modules/home/components/collections'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import Hero from '@modules/home/components/hero'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import SkeletonCategoriesCarousel from '@modules/skeletons/templates/skeleton-categories-carousel'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

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

  const [categories, { collections: collectionsList }, { products }] =
    await Promise.all([
      listCategories(),
      getCollectionsList(),
      getProductsList({
        pageParam: 0,
        queryParams: { limit: 9 },
        countryCode: countryCode,
      }).then(({ response }) => response),
    ])

  const region = await getRegion(countryCode)

  if (!products || !collectionsList || !region) {
    return null
  }

  // CMS data
  const [
    strapiCollections,
    {
      data: { HeroBanner },
    },
    {
      data: { MidBanner },
    },
    { data: posts },
  ] = await Promise.all([
    getCollectionsData(),
    getHeroBannerData(),
    getMidBannerData(),
    getExploreBlogData(),
  ])

  return (
    <>
      {HeroBanner && HeroBanner.Headline && <Hero data={HeroBanner} />}
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
      <Suspense fallback={<SkeletonProductsCarousel />}>
        <ProductCarousel
          testId="our-bestsellers-section"
          products={products}
          regionId={region.id}
          title="Nos meilleures ventes"
          viewAll={{
            link: '/categories',
            text: 'Afficher tout',
          }}
        />
      </Suspense>
    {MidBanner && <Banner data={MidBanner} />}
      {/* ------------------------------------------------ */}
      {posts && posts.length > 0 && <ExploreBlog posts={posts} />}
    </>
  )
}
