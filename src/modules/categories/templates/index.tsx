import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
import { getCategoryByHandle } from '@lib/data/categories'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { getProductPrice } from '@lib/util/get-product-price'
import { Box } from '@modules/common/components/box'
import CategoryBreadcrumbs from './category-breadcrumbs'
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

export default async function CategoryTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; category: string[] }
}) {
  const { sortBy, page, collection, type, material, price } = searchParams
  const { countryCode, category } = params

  const region = await getRegion(countryCode)
  const { product_categories } = await getCategoryByHandle(category)

  const currentCategory = product_categories[product_categories.length - 1]

  if (!currentCategory || !region) notFound()

  const pageNumber = page ? parseInt(page) : 1
  const filters = await getStoreFilters()

  let results: any[] = []
  let count = 0

  try {
    // Try search API first (Solace or your search function)
    const searchResponse = await search({
      currency_code: region.currency_code,
      category_id: currentCategory.id,
      order: sortBy,
      page: pageNumber,
      collection: collection?.split(','),
      type: type?.split(','),
      material: material?.split(','),
      price: price?.split(','),
    })
    results = searchResponse.results
    count = searchResponse.count
  } catch (err) {
    // Fallback to direct Medusa query
    const queryParams: any = {
      limit: 12,
      category_id: [currentCategory.id],
    }

    if (collection) queryParams.collection_id = collection.split(',')
    if (type) queryParams.type_id = type.split(',')
    if (material) queryParams.materials = material.split(',')

    if (price) {
      const ranges = price.split(',')
      ranges.forEach((r) => {
        if (r === 'under-100') queryParams['price[lte]'] = 100
        if (r === '100-500') {
          queryParams['price[gte]'] = 100
          queryParams['price[lte]'] = 500
        }
        if (r === '501-1000') {
          queryParams['price[gte]'] = 501
          queryParams['price[lte]'] = 1000
        }
        if (r === 'more-than-1000') queryParams['price[gte]'] = 1000
      })
    }

    const { products: fallbackProducts, count: fallbackCount } = await getProductsList({
      pageParam: pageNumber,
      queryParams,
      countryCode,
    }).then(({ response }) => response)

    // Shape products and compute cheapest variant price
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
      }
    })

    // JS-side sorting for price
    if (sortBy === 'price_asc') {
      shaped.sort((a, b) => a.calculated_price - b.calculated_price)
    } else if (sortBy === 'price_desc') {
      shaped.sort((a, b) => b.calculated_price - a.calculated_price)
    } else if (sortBy === 'created_at') {
      shaped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    results = shaped
    count = fallbackCount // Use the total count from getProductsList, not the length of current page
  }

  // Recommended products
  const { products: recommendedProducts } = await getProductsList({
    pageParam: 0,
    queryParams: { limit: 9 },
    countryCode,
  }).then(({ response }) => response)

  // Build breadcrumbs
  const categoryTrail: Array<{ name: string; handle: string }> = []
  let cat = currentCategory
  while (cat) {
    categoryTrail.unshift({ name: cat.name, handle: cat.handle })
    cat = cat.parent_category
  }

  return (
    <>
      <Container className="flex flex-col gap-6 !px-2 !pb-8 !pt-4">
        <CategoryBreadcrumbs countryCode={countryCode} categoryTrail={categoryTrail} />

        {/* Subcategories */}
        {currentCategory.category_children?.length > 0 && (
          <Box className="w-full">
            <Box className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <Box className="flex flex-row items-center gap-2 min-w-max">
                {currentCategory.category_children.map((subcat) => (
                  <Box
                    key={subcat.id}
                    as="a"
                    href={`/${countryCode}/categories/${subcat.handle}`}
                    className="group flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-200 shadow-sm cursor-pointer"
                  >
                    <Text className="font-medium text-sm text-gray-700 whitespace-nowrap group-hover:text-black">
                      {subcat.name}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        <Box className="flex flex-col gap-4 mb-2 ">
          <Text className="text-md font-bold text-secondary ml-2">
            {count === 1 ? `${count} product` : `${count} products`}
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

          <ActiveProductFilters
            filters={filters}
            currentCategory={currentCategory}
            countryCode={countryCode}
          />
        </Box>

        <Suspense fallback={<SkeletonProductGrid />}>
          {results.length > 0 ? (
            <PaginatedProducts products={results} page={pageNumber} total={count} countryCode={countryCode} />
          ) : (
            <p className="py-10 text-center text-lg text-secondary">No products.</p>
          )}
        </Suspense>
      </Container>

      {recommendedProducts.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel products={recommendedProducts} regionId={region.id} title="Recommended products" />
        </Suspense>
      )}
    </>
  )
}
