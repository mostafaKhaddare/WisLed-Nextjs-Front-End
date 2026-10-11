'use client'

import { useMemo, useState } from 'react'

import { deleteLineItem, updateLineItem } from '@lib/data/cart'
import { getPricesForVariant } from '@lib/util/get-product-price'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import ErrorMessage from '@modules/checkout/components/error-message'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LineItemOptions from '@modules/common/components/line-item-options'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { Spinner } from '@modules/common/icons'
import Thumbnail from '@modules/products/components/thumbnail'

import ItemQtySelect from '../item-qty-select'

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: 'full' | 'preview'
}

/**
 * Splits a localised currency string such as `MAD 400.00` (or `400.00 MAD`)
 * into its number and its currency code so the two can be styled separately.
 */
function splitPrice(price?: string): { amount: string; currency: string } {
  const trimmed = (price ?? '').trim()
  if (!trimmed) return { amount: '', currency: '' }

  const prefixed = /^(?<cur>[A-Za-z]{3})\s*(?<amt>[\d\s.,]+)$/.exec(trimmed)
  if (prefixed?.groups) {
    return {
      amount: prefixed.groups.amt.trim(),
      currency: prefixed.groups.cur.toUpperCase(),
    }
  }

  const suffixed = /^(?<amt>[\d\s.,]+)\s*(?<cur>[A-Za-z]{3})$/.exec(trimmed)
  if (suffixed?.groups) {
    return {
      amount: suffixed.groups.amt.trim(),
      currency: suffixed.groups.cur.toUpperCase(),
    }
  }

  return { amount: trimmed, currency: '' }
}

const Item = ({ item, type = 'full' }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const deleteItem = async (lineId: string) => {
    setIsDeleting(true)

    await deleteLineItem(lineId)
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  /**
   * `Infinity` when Medusa does not manage this variant's inventory or allows
   * backorders — the server will accept any quantity, so the control must not
   * impose its own ceiling. Otherwise it is the real stock figure, which is the
   * genuine oversale guard.
   */
  const maxQuantity =
    !item.variant?.manage_inventory || item.variant?.allow_backorder
      ? Infinity
      : Math.max(0, item.variant?.inventory_quantity ?? 0)

  // Uses the same price source as LineItemPrice: the variant's calculated price
  // times the quantity, less any promotion adjustments. `convertToLocale` renders
  // it as a localised string that `splitPrice` then pulls apart.
  const { currency_code, calculated_price_number, original_price_number } =
    getPricesForVariant(item.variant) ?? {}

  const adjustmentsSum = (item.adjustments || []).reduce(
    (acc, adjustment) => adjustment.amount + acc,
    0
  )
  const originalPrice = original_price_number * item.quantity
  const currentPrice = calculated_price_number * item.quantity - adjustmentsSum
  const hasReducedPrice = currentPrice < originalPrice

  const { amount, currency } = useMemo(
    () => splitPrice(convertToLocale({ amount: currentPrice, currency_code })),
    [currentPrice, currency_code]
  )
  const currencyLabel = currency || 'MAD'

  return (
    <Box
      className="rounded-[22px] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.12)] small:p-4 dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]"
      data-testid="cart-item"
    >
      {/* Top row: thumbnail, copy, price */}
      <Box className="flex items-start gap-3 small:gap-4">
        <Box className="shrink-0">
          <LocalizedClientLink href={`/products/${handle}`}>
            <Thumbnail
              className="h-20 w-20 rounded-2xl small:h-[132px] small:w-[132px]"
              thumbnail={item.variant?.product?.thumbnail}
              images={item.variant?.product?.images}
              alt={item.product_title}
            />
          </LocalizedClientLink>
        </Box>

        <Box className="flex min-w-0 flex-1 flex-col gap-1">
          <LocalizedClientLink href={`/products/${handle}`}>
            <Heading
              as="h3"
              className="line-clamp-2 font-jakarta text-sm font-semibold text-[#0F1B33] dark:text-white"
            >
              {item.product_title}
            </Heading>
          </LocalizedClientLink>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
        </Box>

        <Box className="flex shrink-0 flex-col items-end gap-0.5">
          {hasReducedPrice && (
            <span className="font-jakarta text-xs font-medium text-[#5B6577] line-through">
              {splitPrice(
                convertToLocale({ amount: originalPrice, currency_code })
              ).amount}
            </span>
          )}
          <span className="font-sora text-[15px] font-bold leading-none text-[#0F1B33] dark:text-white">
            {amount}
          </span>
          <span className="font-jakarta text-[11px] font-bold leading-none text-[#5B6577]">
            {currencyLabel}
          </span>
        </Box>
      </Box>

      {/* Bottom row: stepper on the left, remove on the right */}
      {type === 'full' && (
        <Box className="mt-3 flex items-center justify-between gap-3 border-t border-[#F0F2F8] pt-3 dark:border-white/10">
          <ItemQtySelect
            qty={item.quantity}
            maxQuantity={maxQuantity}
            action={changeQuantity}
            disabled={updating}
          />
          {updating && <Spinner className="text-[#5B6577]" />}
          <button
            type="button"
            onClick={() => deleteItem(item.id)}
            disabled={isDeleting}
            className="font-jakarta text-[13px] font-semibold text-[#B42318] transition-colors hover:text-[#8F1A12] disabled:opacity-50"
          >
            Retirer
          </button>
        </Box>
      )}
      {type === 'preview' && <Text>{item.quantity} item</Text>}
      <ErrorMessage error={error} />
    </Box>
  )
}
export default Item
