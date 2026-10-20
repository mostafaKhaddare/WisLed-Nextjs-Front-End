import { safeDecodeURIComponent } from '@lib/util/safe-decode-uri'
import { getMedusaBackendUrl } from '@lib/medusa-env'
import { medusaTimeoutSignal } from '@lib/util/medusa-timeout'
import { SearchedProducts } from 'types/global'

// Resolved through getMedusaBackendUrl rather than read directly. Reading
// process.env here bypassed the production fallback, so a build without
// NEXT_PUBLIC_MEDUSA_BACKEND_URL sent requests to localhost and the storefront
// failed with ERR_CONNECTION_REFUSED. Every caller that imports BACKEND_URL,
// including lib/data/products.ts, inherits the fix from this one line.
export const BACKEND_URL = getMedusaBackendUrl()
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
  // LED/spec filter parameters
  color?: string[]
  light_color?: string[]
  color_temperature?: string[]
  wattage?: string[]
  wattage_per_metre?: string[]
  power?: string[]
  ip_rating?: string[]
  ip?: string[]
  voltage?: string[]
  roll_length?: string[]
  length?: string[]
  led_type?: string[]
  led_density?: string[]
  density?: string[]
  product_type?: string[]
  strip_width?: string[]
  profile?: string[]
  dimensions?: string[]
  finish?: string[]
  installation_type?: string[]
  mounting_type?: string[]
  compatible_accessories?: string[]
  output_wattage?: string[]
  output_voltage?: string[]
  current?: string[]
  output_current?: string[]
  protocol?: string[]
  protocols?: string[]
  compatibility?: string[]
  controller_type?: string[]
  beam_angle?: string[]
  cuttable?: string[]
  brand?: string[]
  input_voltage?: string[]
  led_technology?: string[]
  technology?: string[]
  profile_type?: string[]
  shape?: string[]
  width?: string[]
  height?: string[]
  diffuser_type?: string[]
  form_factor?: string[]
  dimmable?: string[]
  dimming?: string[]
  control_compatibility?: string[]
  control_protocol?: string[]
  channels?: string[]
  number_of_channels?: string[]
  connectivity?: string[]
  remote_control_type?: string[]
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
  color,
  light_color,
  color_temperature,
  wattage,
  wattage_per_metre,
  power,
  ip_rating,
  ip,
  voltage,
  input_voltage,
  roll_length,
  length,
  width,
  height,
  led_type,
  led_technology,
  technology,
  led_density,
  density,
  product_type,
  strip_width,
  profile,
  profile_type,
  shape,
  dimensions,
  finish,
  diffuser_type,
  installation_type,
  mounting_type,
  form_factor,
  compatible_accessories,
  output_wattage,
  output_voltage,
  current,
  output_current,
  dimmable,
  dimming,
  protocol,
  protocols,
  control_protocol,
  compatibility,
  control_compatibility,
  controller_type,
  beam_angle,
  cuttable,
  brand,
  channels,
  number_of_channels,
  connectivity,
  remote_control_type,
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

  // LED/spec filter parameters
  const addMulti = (key: string, values?: string[]) => {
    if (values && Array.isArray(values)) {
      values.forEach((id) => {
        if (id) searchParams.append(`${key}[]`, id)
      })
    }
  }

  addMulti('color', color)
  addMulti('light_color', light_color)
  addMulti('color_temperature', color_temperature)
  addMulti('wattage', wattage)
  addMulti('wattage_per_metre', wattage_per_metre)
  addMulti('power', power)
  addMulti('ip_rating', ip_rating)
  addMulti('ip', ip)
  addMulti('voltage', voltage)
  addMulti('input_voltage', input_voltage)
  addMulti('roll_length', roll_length)
  addMulti('length', length)
  addMulti('width', width)
  addMulti('height', height)
  addMulti('led_type', led_type)
  addMulti('led_technology', led_technology)
  addMulti('technology', technology)
  addMulti('led_density', led_density)
  addMulti('density', density)
  addMulti('product_type', product_type)
  addMulti('strip_width', strip_width)
  addMulti('profile', profile)
  addMulti('profile_type', profile_type)
  addMulti('shape', shape)
  addMulti('dimensions', dimensions)
  addMulti('finish', finish)
  addMulti('diffuser_type', diffuser_type)
  addMulti('installation_type', installation_type)
  addMulti('mounting_type', mounting_type)
  addMulti('form_factor', form_factor)
  addMulti('compatible_accessories', compatible_accessories)
  addMulti('output_wattage', output_wattage)
  addMulti('output_voltage', output_voltage)
  addMulti('current', current)
  addMulti('output_current', output_current)
  addMulti('dimmable', dimmable)
  addMulti('dimming', dimming)
  addMulti('protocol', protocol)
  addMulti('protocols', protocols)
  addMulti('control_protocol', control_protocol)
  addMulti('compatibility', compatibility)
  addMulti('control_compatibility', control_compatibility)
  addMulti('controller_type', controller_type)
  addMulti('beam_angle', beam_angle)
  addMulti('cuttable', cuttable)
  addMulti('brand', brand)
  addMulti('channels', channels)
  addMulti('number_of_channels', number_of_channels)
  addMulti('connectivity', connectivity)
  addMulti('remote_control_type', remote_control_type)

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
      signal: medusaTimeoutSignal(),
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