import { safeDecodeURIComponent } from '@lib/util/safe-decode-uri'
import { SearchedProducts } from 'types/global'

export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
export const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const PRODUCT_LIMIT = 12

type SearchParams = {
  currency_code: string
  page?: number
  order?: string
  category_id?: string
  collection?: string[]
  type?: string[]
  material?: string[]
  price?: string[]
  query?: string
}

/**
 * Normalise a raw user query before sending to the backend.
 *
 * - Strips leading/trailing whitespace
 * - Collapses multiple spaces
 * - Preserves the original casing (unaccent + case-insensitivity handled server-side)
 * - Keeps technical terms like "24V", "SMD 5050", "IP65" intact
 */
function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')   // collapse multiple spaces
    .slice(0, 200)           // cap length (avoid abuse / too-long queries)
}

export async function search({
  currency_code,
  page = 1,
  order = 'relevance',
  category_id,
  collection,
  type,
  material,
  price,
  query,
}: SearchParams): Promise<SearchedProducts> {
  const sortBy =
    order === 'price_asc'
      ? 'calculated_price'
      : order === 'price_desc'
        ? '-calculated_price'
        : order === 'created_at'
          ? '-created_at'
          : order

  const searchParams = new URLSearchParams({
    currency_code,
    order: sortBy,
    offset: ((page - 1) * PRODUCT_LIMIT).toString(),
    limit: PRODUCT_LIMIT.toString(),
  })

  if (category_id) {
    searchParams.append('category_id[]', category_id)
  }

  if (collection && Array.isArray(collection)) {
    collection.forEach((id) => {
      searchParams.append('collection_id[]', id)
    })
  }

  if (type && Array.isArray(type)) {
    type.forEach((id) => {
      searchParams.append('type_id[]', id)
    })
  }

  if (material && Array.isArray(material)) {
    material.forEach((id) => {
      searchParams.append('materials[]', id)
    })
  }

  if (price && Array.isArray(price)) {
    price.forEach((range) => {
      if (range === '0-100') {
        searchParams.append('price_to', '100')
      } else if (range === '100-300') {
        searchParams.append('price_from', '100')
        searchParams.append('price_to', '300')
      } else if (range === '300-500') {
        searchParams.append('price_from', '300')
        searchParams.append('price_to', '500')
      } else if (range === '500-1000') {
        searchParams.append('price_from', '500')
        searchParams.append('price_to', '1000')
      } else if (range === '1000-999999') {
        searchParams.append('price_from', '1000')
      }
    })
  }

  if (query) {
    const rawQ = safeDecodeURIComponent(query)
    const cleanQ = normalizeQuery(rawQ)
    if (cleanQ) {
      searchParams.append('q', cleanQ)
    }
  }

  const response = await fetch(
    `${BACKEND_URL}/store/search?${searchParams.toString()}`,
    {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    let errorBody: string | undefined
    try {
      errorBody = await response.text()
    } catch (_) { }
    const message = `Response error. Status: ${response.status}${errorBody ? ` Body: ${errorBody}` : ''}`
    throw new Error(message)
  }

  const data = await response.json()

  return {
    results: data.products,
    count: data.count,
  }
}
