'use client'

import { useState } from 'react'

import { updateLineItem } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import { HttpTypes } from '@medusajs/types'
import ErrorMessage from '@modules/checkout/components/error-message'
import { Box } from '@modules/common/components/box'
import DeleteButton from '@modules/common/components/delete-button'
import { Heading } from '@modules/common/components/heading'
import LineItemOptions from '@modules/common/components/line-item-options'
import LineItemPrice from '@modules/common/components/line-item-price'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { Spinner } from '@modules/common/icons'
import Thumbnail from '@modules/products/components/thumbnail'

import ItemQtySelect from '../item-qty-select'

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: 'full' | 'preview'
}

const Item = ({ item, type = 'full' }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
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

  return (
    <Box
      className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-12px_rgba(20,20,59,0.12)] small:gap-4 small:p-4 dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]"
      data-testid="cart-item"
    >
      <Box className="shrink-0">
        <LocalizedClientLink href={`/products/${handle}`}>
          <Thumbnail
            className="h-[88px] w-[88px] rounded-xl small:h-[132px] small:w-[132px]"
            thumbnail={item.variant?.product?.thumbnail}
            images={item.variant?.product?.images}
            alt={item.product_title}
          />
        </LocalizedClientLink>
      </Box>
      <Box className="flex w-full justify-between gap-3">
        <Box className="flex h-full flex-col gap-2">
          <Box>
            <LocalizedClientLink href={`/products/${handle}`}>
              <Heading
                as="h3"
                className="line-clamp-2 font-jakarta text-sm font-semibold text-[#0F1B33] small:text-base dark:text-white"
              >
                {item.product_title}
              </Heading>
            </LocalizedClientLink>
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
          </Box>
          {type === 'full' ? (
            <Box className="flex items-center gap-2">
               <ItemQtySelect
                  qty={item.quantity}
                  maxQuantity={maxQuantity}
                  action={changeQuantity}
                  className="w-full"
                />
                <ErrorMessage error={error} />
              {updating && <Spinner />}
            </Box>
          ) : (
            <Text>{item.quantity} item</Text>
          )}
        </Box>
        <Box
          className={cn('flex flex-col items-end justify-between gap-3', {
            'justify-end': type === 'preview',
          })}
        >
          {type === 'full' && (
            <DeleteButton id={item.id} className="w-12 hover:bg-transparent" />
          )}
          <LineItemPrice item={item} style="tight" />
        </Box>
      </Box>
    </Box>
  )
}
export default Item
