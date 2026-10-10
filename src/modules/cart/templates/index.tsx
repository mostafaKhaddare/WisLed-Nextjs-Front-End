import React from 'react'

import { HttpTypes } from '@medusajs/types'
import { Container } from '@modules/common/components/container'

import EmptyCartMessage from '../components/empty-cart-message'
import ItemsTemplate from './items'
import Summary from './summary'

const CartTemplate = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  return (
    <Container className="flex flex-col items-stretch justify-center">
      {cart?.items?.length ? (
        <div className="flex w-full flex-col gap-8 large:flex-row large:items-start large:justify-between large:gap-12">
          <div className="flex w-full max-w-[765px] shrink grow flex-col gap-4 large:mr-0">
            <ItemsTemplate items={cart?.items} />
          </div>
          <div className="relative w-full large:max-w-[380px]">
            <div className="large:sticky large:top-24 flex flex-col gap-y-4">
              {cart && cart.region && <Summary cart={cart as any} />}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <EmptyCartMessage />
        </div>
      )}
    </Container>
  )
}

export default CartTemplate
