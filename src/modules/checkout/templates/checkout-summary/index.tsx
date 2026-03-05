'use client'

import ItemsPreviewTemplate from '@modules/cart/templates/preview'
import DiscountCode from '@modules/checkout/components/discount-code'
import PaymentButton from '@modules/checkout/components/payment-button'
import { Box } from '@modules/common/components/box'
import CartTotals from '@modules/common/components/cart-totals'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const CheckoutSummary = ({
  cart,
  searchParams,
}: {
  cart: any
  searchParams: { [key: string]: string | string[] | undefined }
}) => {
  return (
    <Box className="relative">
      <Box className="sticky top-8 flex flex-col gap-y-4">
        <ItemsPreviewTemplate items={cart?.items} />
        <DiscountCode cart={cart} />
        <Box className="flex flex-col gap-5 bg-primary p-5">
          <CartTotals totals={cart} />
          {searchParams.step === 'payment' && (
            <Box className="flex flex-col gap-5">
              <PaymentButton cart={cart} data-testid="submit-order-button" />
              <Box className="flex w-full">
                <Text className="text-center text-sm text-secondary">
                  En cliquant sur le bouton Passer la commande, vous confirmez avoir lu, compris et accepté nos{' '}
                  <LocalizedClientLink href="#" className="underline">
                       Conditions d&apos;utilisation
                  </LocalizedClientLink>
                  ,{' '}
                  <LocalizedClientLink href="#" className="underline">
                  Conditions de vente
                  </LocalizedClientLink>{' '}
                  et{' '}
                  <LocalizedClientLink href="#" className="underline">
                    notre Politique de retour
                  </LocalizedClientLink>
                  .
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CheckoutSummary
