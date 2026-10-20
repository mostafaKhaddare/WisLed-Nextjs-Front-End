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
  // LED/spec filter attributes
  color?: {
    id: string
    value: string
  }[]
  light_color?: {
    id: string
    value: string
  }[]
  color_temperature?: {
    id: string
    value: string
  }[]
  wattage?: {
    id: string
    value: string
  }[]
  wattage_per_metre?: {
    id: string
    value: string
  }[]
  power?: {
    id: string
    value: string
  }[]
  ip_rating?: {
    id: string
    value: string
  }[]
  ip?: {
    id: string
    value: string
  }[]
  voltage?: {
    id: string
    value: string
  }[]
  roll_length?: {
    id: string
    value: string
  }[]
  length?: {
    id: string
    value: string
  }[]
  led_type?: {
    id: string
    value: string
  }[]
  led_density?: {
    id: string
    value: string
  }[]
  density?: {
    id: string
    value: string
  }[]
  product_type?: {
    id: string
    value: string
  }[]
  strip_width?: {
    id: string
    value: string
  }[]
  profile?: {
    id: string
    value: string
  }[]
  dimensions?: {
    id: string
    value: string
  }[]
  finish?: {
    id: string
    value: string
  }[]
  installation_type?: {
    id: string
    value: string
  }[]
  mounting_type?: {
    id: string
    value: string
  }[]
  compatible_accessories?: {
    id: string
    value: string
  }[]
  output_wattage?: {
    id: string
    value: string
  }[]
  output_voltage?: {
    id: string
    value: string
  }[]
  current?: {
    id: string
    value: string
  }[]
  output_current?: {
    id: string
    value: string
  }[]
  protocol?: {
    id: string
    value: string
  }[]
  protocols?: {
    id: string
    value: string
  }[]
  compatibility?: {
    id: string
    value: string
  }[]
  controller_type?: {
    id: string
    value: string
  }[]
  beam_angle?: {
    id: string
    value: string
  }[]
  cuttable?: {
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
