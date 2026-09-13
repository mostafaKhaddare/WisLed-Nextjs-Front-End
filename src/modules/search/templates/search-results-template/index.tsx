import React, { Suspense } from 'react'

import { storeSortOptions } from '@lib/constants'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { safeDecodeURIComponent } from '@lib/util/safe-decode-uri'
import { StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { SearchResultsIcon } from '@modules/common/icons'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'
import PaginatedProducts from '@modules/store/templates/paginated-products'

export const runtime = 'edge'

type SearchResultsTemplateProps = {
  query: string
  sortBy?: string
  page?: string
  collection?: string[]
  type?: string[]
  material?: string[]
  price?: string[]
  region: StoreRegion
  countryCode: string
}

export default async function SearchResultsTemplate({
  query,
  sortBy,
  page,
  collection,
  type,
  material,
  price,
  region,
  countryCode,
}: SearchResultsTemplateProps) {
  const pageNumber = page ? parseInt(page) : 1
  const filters = await getStoreFilters()

  let results: any[] = []
  let count = 0
  try {
    const searchResponse = await search({
      currency_code: region.currency_code,
      query,
      order: sortBy,
      page: pageNumber,
      collection,
      type,
      material,
      price,
    })
    results = searchResponse.results
    count = searchResponse.count
  } catch (_) {
    const queryParams: any = {
      limit: 12,
      q: query,
      order:
        sortBy === 'price_asc'
          ? 'calculated_price'
          : sortBy === 'price_desc'
            ? '-calculated_price'
            : sortBy === 'created_at'
              ? '-created_at'
              : sortBy,
    }

    if (collection) queryParams.collection_id = collection
    if (type) queryParams.type_id = type
    if (material) queryParams.materials = material

    if (price) {
      const ranges = price
      if (ranges.includes('under-100')) {
        queryParams.price_to = 100
      }
      if (ranges.includes('100-500')) {
        queryParams.price_from = 100
        queryParams.price_to = 500
      }
      if (ranges.includes('501-1000')) {
        queryParams.price_from = 501
        queryParams.price_to = 1000
      }
      if (ranges.includes('more-than-1000')) {
        queryParams.price_from = 1000
      }
    }

    const {
      response: { products: fallbackProducts, count: fallbackCount },
    } = await getProductsList({
      pageParam: pageNumber,
      queryParams,
      countryCode: countryCode,
    })

    results = fallbackProducts
    count = fallbackCount
  }


  const {
    response: { products: recommendedProducts },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      limit: 9,
    },
    countryCode: countryCode,
  })

  return (
    <>
      <Container className="flex flex-col gap-8 !py-8">
        {results && results.length > 0 ? (
          <>
            <Box className="flex flex-col gap-4">
              <StoreBreadcrumbs
                breadcrumb={`"${safeDecodeURIComponent(query)}"`}
              />
              <Heading
                as="h1"
                className="text-4xl text-basic-primary small:text-5xl"
              >
                &quot;{safeDecodeURIComponent(query)}&quot;
              </Heading>
              <Text className="text-md text-secondary">
                {count === 1 ? `${count} produit` : `${count} produits`}
              </Text>
              <Box className="grid w-full grid-cols-2 items-center justify-between gap-2 small:flex small:flex-wrap">
                <Box className="hidden small:flex">
                  <ProductFilters filters={filters} />
                </Box>
                <ProductFiltersDrawer>
                  <ProductFilters filters={filters} />
                </ProductFiltersDrawer>
                <RefinementList
                  options={storeSortOptions}
                  sortBy={sortBy || 'relevance'}
                />
              </Box>
            </Box>
            <ActiveProductFilters
              filters={filters}
              currentQuery={query}
              countryCode={countryCode}
            />
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                products={results}
                page={pageNumber}
                total={count}
                countryCode={countryCode}
              />
            </Suspense>
          </>
        ) : (
          <Box className="flex flex-col items-center gap-6 p-0 small:pb-14 small:pt-6">
            <SearchResultsIcon />
            <Box className="flex flex-col items-center gap-2">
              <Heading as="h3" className="text-xl small:text-2xl">
                Aucun résultat pour &quot;{safeDecodeURIComponent(query)}&quot;
              </Heading>
              <p className="text-center text-md text-secondary">
                Veuillez réessayer avec une orthographe ou une expression différente
              </p>
            </Box>
          </Box>
        )}
      </Container>
      {recommendedProducts && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={recommendedProducts}
            regionId={region.id}
            title="Produits recommandés"
          />
        </Suspense>
      )}
    </>
  )
}
