import { unstable_noStore as noStore } from 'next/cache'

import { sdk } from '@lib/config'
import { HttpTypes } from '@medusajs/types'
import { BACKEND_URL, PUBLISHABLE_API_KEY } from '@modules/search/actions'
import { logMedusaRequestError } from '@lib/util/medusa-request'
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
}

export const getStoreFilters = async function () {
  const filters: ProductFilters = await fetch(
    `${BACKEND_URL}/store/filter-product-attributes`,
    {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
      },
    }
  ).then((res) => res.json())

  return filters
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
