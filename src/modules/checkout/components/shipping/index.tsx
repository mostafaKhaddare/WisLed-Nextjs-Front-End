'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

import { RadioGroup } from '@headlessui/react'
import { setShippingMethod } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import ErrorMessage from '@modules/checkout/components/error-message'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from '@modules/common/components/radio'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'

const SHIPPING_LOGOS: Record<string, string> = {
  ghazala: '/images/shipping/ghazala-express.png',
  'ghazala express': '/images/shipping/ghazala-express.png',
  ozon: '/images/shipping/ozon-express.png',
  'ozon express': '/images/shipping/ozon-express.png',
  sendit: '/images/shipping/sendit.png',
  sun: '/images/shipping/sun-express.png',
  'sun express': '/images/shipping/sun-express.png',
  amana: '/images/shipping/amana.png',
}

function getShippingLogo(name: string): string | null {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(SHIPPING_LOGOS)) {
    if (key.includes(k)) return v
  }
  return null
}

function ShippingLogo({ name }: { name: string }) {
  const logo = getShippingLogo(name)
  const [error, setError] = useState(false)

  if (!logo || error) {
    return (
      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-[#F8F9FA] border border-[#E5E7EB]">
        <svg className="h-5 w-5 text-[#6B6B6B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-white border border-[#E5E7EB]">
      <Image
        src={logo}
        alt={`Logo ${name}`}
        fill
        sizes="56px"
        className="object-contain p-1"
        onError={() => setError(true)}
      />
    </div>
  )
}

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'delivery'

  const selectedShippingMethod = availableShippingMethods?.find(
    // To do: remove the previously selected shipping method instead of using the last one
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const handleEdit = () => {
    router.push(pathname + '?step=delivery', { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + '?step=payment', { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Box className="bg-primary p-5">
      <Box
        className={cn('flex flex-row items-center justify-between', {
          'mb-6': isOpen || (!isOpen && cart.shipping_methods?.length > 0),
        })}
      >
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none':
              !isOpen && cart.shipping_methods?.length === 0,
          })}
        >
          {!isOpen && cart.shipping_methods?.length === 0 ? (
            <Stepper>2</Stepper>
          ) : !isOpen && (cart.shipping_methods?.length ?? 0) > 0 ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">2</Stepper>
          )}
          Livraison
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="tonal"
              size="sm"
              onClick={handleEdit}
              data-testid="edit-delivery-button"
            >
              Modifier
            </Button>
          )}
      </Box>
      {isOpen ? (
        <Box data-testid="delivery-options-container">
          <RadioGroup value={selectedShippingMethod?.id || ''} onChange={set}>
            {availableShippingMethods?.map((option) => {
              return (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  data-testid="delivery-option-radio"
                  className={cn(
                    'flex cursor-pointer flex-row items-center justify-between gap-2 border p-2.5 !pr-4 text-basic-primary transition-all duration-200 rounded-lg hover:border-[#FFC400]/60',
                    {
                      'border-[#FFC400] bg-[#FFFBEB]':
                        option.id === selectedShippingMethod?.id,
                    }
                  )}
                >
                  <Box className="flex w-full items-center gap-x-3">
                    <RadioGroupRoot className="m-2">
                      <RadioGroupItem
                        id={option.id}
                        value={option.id}
                        checked={option.id === selectedShippingMethod?.id}
                      >
                        <RadioGroupIndicator />
                      </RadioGroupItem>
                    </RadioGroupRoot>
                    <ShippingLogo name={option.name} />
                    <Box className="flex w-full flex-col gap-1 small:flex-row small:items-center small:justify-between">
                      <span className="text-base font-medium">{option.name}</span>
                      <span className="justify-self-end text-base font-semibold">
                        {convertToLocale({
                          amount: option.amount,
                          currency_code: cart?.currency_code,
                        })}
                      </span>
                    </Box>
                  </Box>
                </RadioGroup.Option>
              )
            })}
          </RadioGroup>
          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
          <Button
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!cart.shipping_methods?.[0]}
            data-testid="submit-delivery-option-button"
          >
            Continuer vers le paiement
          </Button>
        </Box>
      ) : (
        <Box className="text-small-regular">
          {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
            <div className="flex items-center gap-3 p-4">
              <ShippingLogo name={selectedShippingMethod?.name || ''} />
              <div className="flex flex-col">
                <Text size="lg" className="text-basic-primary">
                  Méthode de livraison
                </Text>
                <Text className="text-secondary">
                  {selectedShippingMethod?.name},{' '}
                  {convertToLocale({
                    amount: selectedShippingMethod?.amount,
                    currency_code: cart?.currency_code,
                  })}
                </Text>
              </div>
            </div>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Shipping
