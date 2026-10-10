'use client'

import { HttpTypes } from '@medusajs/types'
import DiscountCode from '@modules/checkout/components/discount-code'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import CartTotals from '@modules/common/components/cart-totals'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return 'address'
  } else if (cart?.shipping_methods?.length === 0) {
    return 'delivery'
  } else {
    return 'payment'
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <Box className="flex w-full flex-col gap-4">
      <DiscountCode cart={cart} />
      <Box className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-12px_rgba(20,20,59,0.12)] small:p-6 dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]">
        <CartTotals totals={cart} />
        <LocalizedClientLink
          href={'/checkout?step=' + step}
          data-testid="checkout-button"
        >
          <Button className="w-full">Procéder au paiement</Button>
        </LocalizedClientLink>
      </Box>
    </Box>
  )
}

export default Summary
