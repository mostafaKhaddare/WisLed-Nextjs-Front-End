import { Suspense } from 'react'

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
  const region = await getRegion(countryCode)

  // Without a region the catalog can be neither priced nor searched. That
  // happens when the backend is offline (e.g. a suspended host), so show a
  // notice instead of a 404 — the rest of the site keeps serving.
  if (!region) {
    return (
      <Container className="flex flex-col gap-8 !pb-8 !pt-4">
        <Box className="flex flex-col gap-4">
          <Text className="text-md text-secondary">
            Le catalogue est temporairement indisponible. Veuillez réessayer
            dans quelques instants.
          </Text>
        </Box>
      </Container>
    )
  }

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
  } catch (_) {
    // Fallback: fetch products from Medusa
    const queryParams: any = {
      limit: 12,
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