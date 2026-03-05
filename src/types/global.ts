export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type ProductFilters = {
  collection: {
    id: string
    value: string
  }[]
  type: {
    id: string
    value: string
  }[]
  material: {
    id: string
    value: string
  }[]
}
export type CategoryImage = {
  id?: string

  url: string

  type: 'thumbnail' | 'image'

  category_id?: string
}

export type SearchedProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string
  calculated_price: string
  sale_price: string
  regular_price: string
  created_at: string
  updated_at: string
  /** Variant data — present from both the search endpoint and Medusa fallback */
  variants?: Array<{
    id: string
    thumbnail?: string | null
    options?: Array<{ option_id: string; value: string }>
    [key: string]: any
  }>
  /** Option definitions (name + id) — present from both paths */
  options?: Array<{
    id: string
    title: string
    [key: string]: any
  }>
}

export type SearchedProducts = {
  results: SearchedProduct[]
  count: number
}
