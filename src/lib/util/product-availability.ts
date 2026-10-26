import { HttpTypes } from '@medusajs/types'

/**
 * The three states Medusa can expose through the Store API for a variant.
 *
 * - `in-stock`: either inventory is not managed, or a positive quantity is
 *   available in the sales channel's stock locations.
 * - `backorder`: inventory is managed and currently unavailable, but Medusa
 *   accepts the order because backorders are allowed.
 * - `out-of-stock`: inventory is managed, nothing is available, and backorders
 *   are disabled.
 */
export type VariantAvailability = 'in-stock' | 'backorder' | 'out-of-stock'

type VariantStockFields = Pick<
  HttpTypes.StoreProductVariant,
  'manage_inventory' | 'allow_backorder' | 'inventory_quantity'
>

type ProductStockFields = Pick<HttpTypes.StoreProduct, 'variants'>

/**
 * Resolve a single variant's availability using the same rules as the Medusa
 * Store API and the product page's add-to-cart control.
 *
 * Important: `inventory_quantity` is `null` when `manage_inventory` is false.
 * Treating that `null` as zero is what made untracked products look sold out to
 * Google even though the storefront could sell them.
 */
export function getVariantAvailability(
  variant?: VariantStockFields | null
): VariantAvailability {
  if (!variant) {
    return 'out-of-stock'
  }

  // Medusa does not track stock for these variants, so quantity is irrelevant.
  if (!variant.manage_inventory) {
    return 'in-stock'
  }

  if ((variant.inventory_quantity ?? 0) > 0) {
    return 'in-stock'
  }

  return variant.allow_backorder ? 'backorder' : 'out-of-stock'
}

export function isVariantPurchasable(
  variant?: VariantStockFields | null
): boolean {
  return getVariantAvailability(variant) !== 'out-of-stock'
}

/**
 * Product-level availability. A product is purchasable when at least one of
 * its variants is, which is how Google's Product schema models a product with
 * several variants.
 */
export function getProductAvailability(
  product?: ProductStockFields | null
): VariantAvailability {
  const variants = product?.variants ?? []
  const states = variants.map(getVariantAvailability)

  if (states.includes('in-stock')) {
    return 'in-stock'
  }

  if (states.includes('backorder')) {
    return 'backorder'
  }

  return 'out-of-stock'
}

export function isProductPurchasable(
  product?: ProductStockFields | null
): boolean {
  return getProductAvailability(product) !== 'out-of-stock'
}
