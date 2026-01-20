import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
import { getCollectionByHandle } from '@lib/data/collections'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { getProductPrice } from '@lib/util/get-product-price'
import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'

export const runtime = 'edge'

export default async function CollectionTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; handle: string }
}) {
  const { sortBy, page, type, material, price } = await searchParams
  const { countryCode, handle } = await params

  const region = await getRegion(countryCode)
  if (!region) notFound()

  const currentCollection = await getCollectionByHandle(handle).then(
    (collection: StoreCollection) => collection
  )
  if (!currentCollection) notFound()

  const pageNumber = page ? parseInt(page) : 1
  const filters = await getStoreFilters()

  let results: any[] = []
  let count = 0
  try {
    const searchResponse = await search({
      currency_code: region.currency_code,
      order: sortBy,
      page: pageNumber,
      collection: [currentCollection.id],
      type: type?.split(','),
      material: material?.split(','),
      price: price?.split(','),
    })
    results = searchResponse.results
    count = searchResponse.count
  } catch (_) {
    const queryParams: any = {
      limit: 12,
      order:
        sortBy === 'price_asc'
          ? 'calculated_price'
          : sortBy === 'price_desc'
            ? '-calculated_price'
            : sortBy === 'created_at'
              ? '-created_at'
              : sortBy,
      collection_id: [currentCollection.id],
    }

    if (type) queryParams.type_id = type.split(',')
    if (material) queryParams.materials = material.split(',')

    if (price) {
      const ranges = price.split(',')
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

    const { products: fallbackProducts, count: fallbackCount } =
      await getProductsList({
        pageParam: pageNumber,
        queryParams,
        countryCode: countryCode,
      }).then(({ response }) => response)

    const shaped = fallbackProducts.map((product: any) => {
      const prices = getProductPrice({ product })
      const cheapest = prices?.cheapestPrice
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail,
        created_at: product.created_at,
        updated_at: product.updated_at,
        calculated_price: cheapest?.calculated_price_number?.toString() ?? '0',
        sale_price: cheapest?.original_price_number?.toString() ?? '0',
        regular_price: cheapest?.original_price_number?.toString() ?? '0',
      }
    })

    results = shaped
    count = fallbackCount ?? shaped.length
  }

  // TODO: Add logic in future
  const { products: recommendedProducts } = await getProductsList({
    pageParam: 0,
    queryParams: { limit: 9 },
    countryCode: params.countryCode,
  }).then(({ response }) => response)

  return (
    <>
      <Container className="flex flex-col gap-8 !pb-8 !pt-4">
        <Box className="flex flex-col gap-4">
          <Text className="text-md text-secondary">
            {count === 1 ? `${count} product` : `${count} products`}
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
          currentCollection={currentCollection}
          countryCode={countryCode}
        />
        <Suspense fallback={<SkeletonProductGrid />}>
          {results && results.length > 0 ? (
            <PaginatedProducts
              products={results}
              page={pageNumber}
              total={count}
              countryCode={countryCode}
            />
          ) : (
            <p className="py-10 text-center text-lg text-secondary">
              No products.
            </p>
          )}
        </Suspense>
      </Container>
      {recommendedProducts && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={recommendedProducts}
            regionId={region.id}
            title="Recommended products"
          />
        </Suspense>
      )}
    </>
  )
}
