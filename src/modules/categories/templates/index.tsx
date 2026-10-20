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
import FiltersModal from '@modules/store/components/filters/filters-modal'
import PaginatedProducts from '@modules/store/templates/paginated-products'
import ProjectAdviceCard from '@modules/products/components/project-advice-card'
import { SubcategoryCards } from '../components/subcategory-cards'
import QuickFilters from '@modules/store/components/filters/quick-filters'

export const runtime = 'edge'

export default async function CategoryTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; category: string[] }
}) {
  const {
    sortBy,
    page,
    collection,
    type,
    material,
    price,
    color,
    light_color,
    color_temperature,
    wattage,
    wattage_per_metre,
    power,
    ip_rating,
    ip,
    voltage,
    roll_length,
    length,
    led_type,
    led_density,
    density,
    product_type,
    strip_width,
    profile,
    dimensions,
    finish,
    installation_type,
    mounting_type,
    compatible_accessories,
    output_wattage,
    output_voltage,
    current,
    output_current,
    protocol,
    protocols,
    compatibility,
    controller_type,
    beam_angle,
    cuttable,
  } = searchParams
  const { countryCode, category } = params

  const region = await getRegion(countryCode)

  let categoryData: any[] = []
  try {
    categoryData = await getCategoryByHandle(category)
  } catch {
    categoryData = []
  }

  const currentCategory = categoryData[0]

  if (!currentCategory || !region) notFound()

  const pageNumber = page ? parseInt(page) : 1
  const filters = await getStoreFilters(currentCategory.id)

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
      color: color?.split(','),
      light_color: light_color?.split(','),
      color_temperature: color_temperature?.split(','),
      wattage: wattage?.split(','),
      wattage_per_metre: wattage_per_metre?.split(','),
      power: power?.split(','),
      ip_rating: ip_rating?.split(','),
      ip: ip?.split(','),
      voltage: voltage?.split(','),
      roll_length: roll_length?.split(','),
      length: length?.split(','),
      led_type: led_type?.split(','),
      led_density: led_density?.split(','),
      density: density?.split(','),
      product_type: product_type?.split(','),
      strip_width: strip_width?.split(','),
      profile: profile?.split(','),
      dimensions: dimensions?.split(','),
      finish: finish?.split(','),
      installation_type: installation_type?.split(','),
      mounting_type: mounting_type?.split(','),
      compatible_accessories: compatible_accessories?.split(','),
      output_wattage: output_wattage?.split(','),
      output_voltage: output_voltage?.split(','),
      current: current?.split(','),
      output_current: output_current?.split(','),
      protocol: protocol?.split(','),
      protocols: protocols?.split(','),
      compatibility: compatibility?.split(','),
      controller_type: controller_type?.split(','),
      beam_angle: beam_angle?.split(','),
      cuttable: cuttable?.split(','),
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

    // New filter parameters for fallback
    if (color) queryParams.color = color.split(',')
    if (light_color) queryParams.light_color = light_color.split(',')
    if (color_temperature) queryParams.color_temperature = color_temperature.split(',')
    if (wattage) queryParams.wattage = wattage.split(',')
    if (wattage_per_metre) queryParams.wattage_per_metre = wattage_per_metre.split(',')
    if (power) queryParams.power = power.split(',')
    if (ip_rating) queryParams.ip_rating = ip_rating.split(',')
    if (ip) queryParams.ip = ip.split(',')
    if (voltage) queryParams.voltage = voltage.split(',')
    if (roll_length) queryParams.roll_length = roll_length.split(',')
    if (length) queryParams.length = length.split(',')
    if (led_type) queryParams.led_type = led_type.split(',')
    if (led_density) queryParams.led_density = led_density.split(',')
    if (density) queryParams.density = density.split(',')
    if (product_type) queryParams.product_type = product_type.split(',')
    if (strip_width) queryParams.strip_width = strip_width.split(',')
    if (profile) queryParams.profile = profile.split(',')
    if (dimensions) queryParams.dimensions = dimensions.split(',')
    if (finish) queryParams.finish = finish.split(',')
    if (installation_type) queryParams.installation_type = installation_type.split(',')
    if (mounting_type) queryParams.mounting_type = mounting_type.split(',')
    if (compatible_accessories) queryParams.compatible_accessories = compatible_accessories.split(',')
    if (output_wattage) queryParams.output_wattage = output_wattage.split(',')
    if (output_voltage) queryParams.output_voltage = output_voltage.split(',')
    if (current) queryParams.current = current.split(',')
    if (output_current) queryParams.output_current = output_current.split(',')
    if (protocol) queryParams.protocol = protocol.split(',')
    if (protocols) queryParams.protocols = protocols.split(',')
    if (compatibility) queryParams.compatibility = compatibility.split(',')
    if (controller_type) queryParams.controller_type = controller_type.split(',')
    if (beam_angle) queryParams.beam_angle = beam_angle.split(',')
    if (cuttable) queryParams.cuttable = cuttable.split(',')

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

     const response = await getProductsList({
       pageParam: pageNumber,
       queryParams,
       countryCode,
     })
     const fallbackProducts = response.response.products
     const fallbackCount = response.response.count

     // Shape products and compute cheapest variant price
     const shaped = (fallbackProducts || []).map((product: any) => {
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
    const recommendedResponse = await getProductsList({
      pageParam: 0,
      queryParams: { limit: 9 },
      countryCode,
    })
    const recommendedProducts = recommendedResponse.response.products || []

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

        {/* Heading row: title on the left, product count on the right */}
        <Box className="flex items-end justify-between gap-4 px-2">
          <h1 className="font-sora text-[32px] font-bold leading-[1.15] tracking-[-0.32px] text-[#0F1B33] dark:text-white">
            {currentCategory.name}
          </h1>
          <Text className="shrink-0 font-jakarta text-[13px] text-[#5B6577]">
            {count === 1 ? `${count} produit` : `${count} produits`}
          </Text>
        </Box>

        {currentCategory.description && (
          <Box className="px-2">
            <Text className="font-jakarta text-sm leading-[1.55] text-[#5B6577] dark:text-gray-400">
              {currentCategory.description}
            </Text>
          </Box>
        )}

        {/* Subcategories */}
        {currentCategory.category_children?.length > 0 && (
          <SubcategoryCards
            subcategories={currentCategory.category_children.map((subcat) => ({
              id: subcat.id,
              name: subcat.name,
              handle: subcat.handle,
              image: (subcat as any).product_category_image?.[0] || null,
            }))}
          />
        )}

        {/* Quick filter chips */}
        <QuickFilters filters={filters} />

        <Box className="flex flex-col gap-4 mb-2">
          <Box className="flex items-center justify-between px-2">
            <Text className="text-sm font-semibold text-secondary">
              {count === 1 ? `${count} produit` : `${count} produits`}
            </Text>
          </Box>

          <Box className="grid w-full grid-cols-2 items-center justify-between gap-2 small:flex small:flex-wrap small:items-center small:justify-between">
            <Box className="hidden small:flex small:flex-wrap small:items-center small:gap-2">
              <ProductFilters filters={filters} />
            </Box>
            <FiltersModal filters={filters} count={count} />
            <Box className="flex items-center gap-2">
              <RefinementList options={storeSortOptions} sortBy={sortBy || 'relevance'} />
            </Box>
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
            <Box className="py-16 text-center">
              <Text className="text-lg font-semibold text-black dark:text-white/90">Aucun produit trouvé</Text>
              <Text className="text-sm text-secondary">
                Essayez d&apos;ajuster les filtres ou explorez une autre catégorie.
              </Text>
            </Box>
          )}
        </Suspense>
      </Container>

      {recommendedProducts.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel products={recommendedProducts} regionId={region.id} title="Produits recommandés " />
        </Suspense>
      )}

      <ProjectAdviceCard />
    </>
  )
}