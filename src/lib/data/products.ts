import { unstable_noStore as noStore } from 'next/cache'

import { sdk } from '@lib/config'
import { HttpTypes } from '@medusajs/types'
import { BACKEND_URL, PUBLISHABLE_API_KEY } from '@modules/search/actions'
import { logMedusaRequestError } from '@lib/util/medusa-request'
import { medusaTimeoutSignal } from '@lib/util/medusa-timeout'
import { ProductFilters } from 'types/global'

import { getRegion } from './regions'

export const getProductsById = async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  noStore()
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata,*options',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products)
    .catch((error) => {
      logMedusaRequestError('/store/products', error)
      return []
    })
}

export const getProductByHandle = async function (
  handle: string,
  regionId: string
) {
  noStore()
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata,*options',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products[0])
}

export const getProductsList = async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  noStore()

  const limit = queryParams?.limit || 12
  const offset = Math.max(0, (pageParam - 1) * limit)
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*options',
        ...queryParams,
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams,
      }
    })
    .catch((error) => {
      logMedusaRequestError('/store/products', error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
      }
    })
}

export const getProductsListByCollectionId = async function ({
  collectionId,
  countryCode,
  excludeProductId,
  limit = 12,
  offset = 0,
}: {
  collectionId: string
  countryCode: string
  excludeProductId?: string
  limit?: number
  offset?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> {
  noStore()
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  return sdk.store.product
    .list(
      {
        limit,
        offset,
        collection_id: [collectionId],
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*options',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      if (excludeProductId) {
        products = products.filter((product) => product.id !== excludeProductId)
      }

      const nextPage = count > offset + limit ? offset + limit : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
      }
    })
    .catch((error) => {
      logMedusaRequestError('/store/products', error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
      }
    })
}

// Facets drive the filter UI. Without a category id the facets are
// global; with one they describe only that category's products, which
// is what makes each category offer its own filter set. Next caches
// fetch responses per URL, so each category gets its own 1h entry.
//
// The fetch carries the same hard deadline as the SDK calls, and a
// failure degrades to an empty filter set instead of throwing: the
// catalog page then renders without filter options rather than going
// down with the backend.
const STORE_FILTER_FACET_KEYS = [
  'collection',
  'type',
  'material',
  'color_temperature',
  'wattage',
  'ip_rating',
  'voltage',
  'product_type',
  'strip_width',
  'profile',
] as const

function emptyStoreFilters(): ProductFilters {
  return {
    collection: [],
    type: [],
    material: [],
    color_temperature: [],
    wattage: [],
    ip_rating: [],
    voltage: [],
    product_type: [],
    strip_width: [],
    profile: [],
  }
}

type FilterOption = ProductFilters['collection'][number]

/**
 * Coerce one facet from the API into `{ id, value }` options.
 *
 * Anything that is not a usable option is dropped instead of being forwarded,
 * because these values cross the server → client boundary and are rendered
 * straight into the filter UI.
 */
function toOptionList(value: unknown): FilterOption[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry) => {
    if (typeof entry === 'string') {
      return entry ? [{ id: entry, value: entry }] : []
    }
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>
      const id = typeof record.id === 'string' ? record.id : ''
      if (!id) return []
      const value =
        typeof record.value === 'string' && record.value ? record.value : id
      return [{ id, value }]
    }
    return []
  })
}

/**
 * Force the response into the `ProductFilters` shape.
 *
 * The storefront filter components index this object directly
 * (`filters.collection.map(…)`), so a response that is missing facets — or an
 * error body — must never reach them.
 */
function normalizeStoreFilters(data: unknown): ProductFilters {
  const filters = emptyStoreFilters()
  if (!data || typeof data !== 'object') return filters

  const record = data as Record<string, unknown>
  for (const key of STORE_FILTER_FACET_KEYS) {
    filters[key] = toOptionList(record[key])
  }
  return filters
}

export const getStoreFilters = async function (
  categoryId?: string
): Promise<ProductFilters> {
  const url = new URL(`${BACKEND_URL}/store/filter-product-attributes`)
  if (categoryId) {
    url.searchParams.set('category_id', categoryId)
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      signal: medusaTimeoutSignal(),
      next: {
        revalidate: 3600,
      },
    })

    // A failing endpoint answers with a Medusa error body (`{ type, code,
    // message }`) rather than facets. Parsing it anyway and returning it as
    // `filters` is what sent an unguarded `undefined.map()` into the browser
    // and took the category page down, so a non-2xx becomes "no facets".
    if (!response.ok) {
      logMedusaRequestError(
        '/store/filter-product-attributes',
        new Error(`Unexpected status ${response.status}`)
      )
      return emptyStoreFilters()
    }

    return normalizeStoreFilters(await response.json())
  } catch (error) {
    logMedusaRequestError('/store/filter-product-attributes', error)
    return emptyStoreFilters()
  }
}

export const getBestSellers = async function ({
  countryCode,
  limit = 10,
}: {
  countryCode: string
  limit?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return []
  }

  // Fetch a larger batch to find best sellers
  // Since standard API doesn't filter by metadata efficiently, we fetch 100 recent items and filter.
  // Ideally, use a Collection for this, but this supports the metadata request.
  let products: HttpTypes.StoreProduct[]
  try {
    const response = await sdk.store.product.list(
      {
        limit: 100,
        region_id: region.id,
        fields: '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,+metadata,*options',
      },
      { next: { tags: ['products'] } }
    )
    products = response.products
  } catch (error) {
    logMedusaRequestError('/store/products', error)
    return []
  }

  const bestSellers = products.filter((p) => {
    // Check for "is_best_seller" metadata (string 'true' or boolean true)
    const isBestSeller = p.metadata?.is_best_seller
    return isBestSeller === 'true' || isBestSeller === true
  })

  // Return filtered best sellers, or fallback to top products if none found (optional, here we return specific matches)
  return bestSellers.length > 0 ? bestSellers.slice(0, limit) : products.slice(0, limit)
}
