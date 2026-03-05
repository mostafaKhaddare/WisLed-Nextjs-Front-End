import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { getProductPrice } from '@lib/util/get-product-price'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

import ProductFilters from '../components/filters'
import ActiveProductFilters from '../components/filters/active-filters'
import ProductFiltersDrawer from '../components/filters/filters-drawer'
import PaginatedProducts from './paginated-products'

export const runtime = 'edge'

export default async function StoreTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params?: { countryCode?: string }
}) {
  const { countryCode } = params ?? {}
  const { sortBy, page, collection, type, material, price } = searchParams
  const region = await getRegion(countryCode)

  if (!region) return notFound()

  const pageNumber = page ? parseInt(page) : 1
  const filters = await getStoreFilters()

  let results: any[] = []
  let count = 0

  try {
    // Try using search API first
    const searchResponse = await search({
      currency_code: region.currency_code,
      order: sortBy,
      page: pageNumber,
      collection: collection?.split(','),
      type: type?.split(','),
      material: material?.split(','),
      price: price?.split(','),
    })
    results = searchResponse.results
    count = searchResponse.count
  } catch (_) {
    // Fallback: fetch products from Medusa
    const queryParams: any = {
      limit: 12,
    }

    if (collection) queryParams.collection_id = collection.split(',')
    if (type) queryParams.type_id = type.split(',')
    if (material) queryParams.materials = material.split(',')

    if (price) {
      const ranges = price.split(',')
      ranges.forEach((r) => {
        if (r === '0-100') {
          queryParams.price_to = 100
        }
        if (r === '100-300') {
          queryParams.price_from = 100
          queryParams.price_to = 300
        }
        if (r === '300-500') {
          queryParams.price_from = 300
          queryParams.price_to = 500
        }
        if (r === '500-1000') {
          queryParams.price_from = 500
          queryParams.price_to = 1000
        }
        if (r === '1000-999999') {
          queryParams.price_from = 1000
        }
      })
    }

    const { products: fallbackProducts, count: fallbackCount } =
      await getProductsList({
        pageParam: pageNumber,
        queryParams,
        countryCode,
      }).then(({ response }) => response)

    // Shape products and get cheapest variant price
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
        calculated_price: cheapest?.calculated_price_number ?? 0,
        sale_price: cheapest?.original_price_number ?? 0,
        regular_price: cheapest?.original_price_number ?? 0,
        // Include variants & options so ProductTile can render variant swatches
        variants: product.variants ?? [],
        options: product.options ?? [],
      }
    })

    // JS-side sorting
    if (sortBy === 'price_asc') {
      shaped.sort((a, b) => a.calculated_price - b.calculated_price)
    } else if (sortBy === 'price_desc') {
      shaped.sort((a, b) => b.calculated_price - a.calculated_price)
    } else if (sortBy === 'created_at') {
      shaped.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    results = shaped
    count = fallbackCount ?? shaped.length
  }

  // Recommended products
  const { products: recommendedProducts } = await getProductsList({
    pageParam: 0,
    queryParams: { limit: 9 },
    countryCode,
  }).then(({ response }) => response)

  return (
    <>
      <Container className="flex flex-col gap-8 !pb-8 !pt-4">
        <Box className="flex flex-col gap-4">
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
            <RefinementList options={storeSortOptions} sortBy={sortBy || 'relevance'} />
          </Box>
        </Box>

        <ActiveProductFilters countryCode={countryCode} filters={filters} />

        <Suspense fallback={<SkeletonProductGrid />}>
          {results.length > 0 ? (
            <PaginatedProducts products={results} page={pageNumber} total={count} countryCode={countryCode} />
          ) : (
            <p className="py-10 text-center text-lg text-secondary">Aucun produit.</p>
          )}
        </Suspense>
      </Container>

      {recommendedProducts.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel products={recommendedProducts} regionId={region.id} title="Produits recommandés" />
        </Suspense>
      )}
    </>
  )
}
