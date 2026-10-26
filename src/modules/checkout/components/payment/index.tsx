'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import {
  getPaymentInfo,
  getPaymentPriority,
  isManual,
  isStripe as isStripeFunc,
  paymentInfoMap,
} from '@lib/constants'
import { initiatePaymentSession } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import { findActivePaymentSession } from '@lib/util/payment-session'
import ErrorMessage from '@modules/checkout/components/error-message'
import PaymentContainer from '@modules/checkout/components/payment-container'
import { StripeContext } from '@modules/checkout/components/payment-wrapper'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'
import { CardElement } from '@stripe/react-stripe-js'
import { StripeCardElementOptions } from '@stripe/stripe-js'

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = findActivePaymentSession(
    cart?.payment_collection?.payment_sessions
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'payment'

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isManualSelected = isManual(selectedPaymentMethod)
  const stripeReady = useContext(StripeContext)
  const selectedPaymentInfo = getPaymentInfo(selectedPaymentMethod)

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) ||
    paidByGiftcard

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: 'Inter, sans-serif',
          color: '#424270',
          '::placeholder': {
            color: 'rgb(107 114 128)',
          },
        },
      },
      classes: {
        base: 'pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out',
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false,
    })
  }

  const handleSubmit = async (paymentMethodId: string) => {
    if (!paymentMethodId) return

    setIsLoading(true)
    setError(null)

    try {
      await initiatePaymentSession(cart, {
        provider_id: paymentMethodId,
      })
      // Refresh the server component so the new payment session (and the
      // correct amount) reaches PaymentButton and the order summary.
      router.refresh()
    } catch (err: any) {
      setError(
        err?.message ||
          "Impossible d'initialiser le paiement. Veuillez réessayer."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentMethodChange = async (value: string) => {
    if (value === selectedPaymentMethod && activeSession?.provider_id === value) {
      return
    }

    setSelectedPaymentMethod(value)
    await handleSubmit(value)
  }

  // When no provider is selected yet, choose COD when available (otherwise the
  // first provider) and initialise its payment session. This removes the
  // "Select a payment method" dead-end on the checkout page.
  useEffect(() => {
    if (!isOpen || paidByGiftcard || !availablePaymentMethods?.length) {
      return
    }

    const availableIds = availablePaymentMethods.map((method) => method.id)
    const activeProviderId = activeSession?.provider_id

    if (selectedPaymentMethod && availableIds.includes(selectedPaymentMethod)) {
      return
    }

    if (activeProviderId && availableIds.includes(activeProviderId)) {
      setSelectedPaymentMethod(activeProviderId)
      return
    }

    const defaultMethod = [...availablePaymentMethods].sort(
      (a, b) => getPaymentPriority(a.id) - getPaymentPriority(b.id)
    )[0]

    if (defaultMethod?.id) {
      setSelectedPaymentMethod(defaultMethod.id)
      void handleSubmit(defaultMethod.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    paidByGiftcard,
    availablePaymentMethods,
    activeSession?.provider_id,
    selectedPaymentMethod,
  ])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Box className="bg-primary p-5">
      <Box className="mb-6 flex flex-row items-center justify-between">
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none': !isOpen && !paymentReady,
          })}
        >
          {!isOpen && !paymentReady ? (
            <Stepper>3</Stepper>
          ) : !isOpen && paymentReady ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">3</Stepper>
          )}
          Paiement
        </Heading>
        {!isOpen && paymentReady && (
          <Button
            variant="tonal"
            size="sm"
            onClick={handleEdit}
            data-testid="edit-payment-button"
          >
            modifier
          </Button>
        )}
      </Box>
      <Box>
        <Box className={isOpen ? 'block' : 'hidden'}>
          {!paidByGiftcard && !availablePaymentMethods?.length && (
            <Text className="mb-4 text-secondary">
              Aucun mode de paiement n&apos;est disponible pour votre région.
              Contactez-nous pour finaliser votre commande.
            </Text>
          )}

          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
                disabled={isLoading}
              >
                {[...availablePaymentMethods]
                  .sort(
                    (a, b) =>
                      getPaymentPriority(a.id) - getPaymentPriority(b.id)
                  )
                  .map((paymentMethod) => {
                    return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        key={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        disabled={isLoading}
                      />
                    )
                  })}
              </RadioGroup>
              {isStripe && stripeReady && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <Text className="mb-3 text-md text-basic-primary">
                    Saisissez les informations de votre carte:
                  </Text>
                  <CardElement
                    options={useOptions}
                    onChange={(e) => {
                      setCardBrand(
                        e.brand &&
                          e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                      )
                      setError(e.error?.message || null)
                    }}
                  />
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus mb-1 text-ui-fg-base">
                Méthode de paiement
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Carte cadeau
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {error && selectedPaymentMethod && (
            <Button
              variant="tonal"
              size="sm"
              className="mt-3"
              onClick={() => handleSubmit(selectedPaymentMethod)}
              isLoading={isLoading}
              data-testid="retry-payment-method-button"
            >
              Réessayer
            </Button>
          )}


        </Box>

        <Box className={isOpen ? 'hidden' : 'block'}>
          {cart && paymentReady && activeSession ? (
            <Box className="flex flex-col items-start">
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-basic-primary">
                  Méthode de paiement
                </Text>
                <Text
                  className="font-normal text-secondary"
                  data-testid="payment-method-summary"
                >
                  {selectedPaymentInfo.title}
                </Text>
                {selectedPaymentInfo.description && (
                  <Text className="mt-1 text-sm text-secondary">
                    {selectedPaymentInfo.description}
                  </Text>
                )}
              </Box>
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-basic-primary">
                  Détails du paiement
                </Text>
                <div
                  className="flex items-center gap-2 text-md text-basic-primary"
                  data-testid="payment-details-summary"
                >
                  <Box className="flex h-7 w-fit items-center p-2">
                    {selectedPaymentInfo.icon}
                  </Box>
                  <Text className="font-normal text-secondary">
                    {isStripeFunc(selectedPaymentMethod)
                      ? cardBrand || 'Carte bancaire'
                      : isManualSelected
                        ? 'Aucun paiement en ligne requis'
                        : 'Un complément vous sera demandé'}
                  </Text>
                </div>
              </Box>
            </Box>
          ) : paidByGiftcard ? (
            <Box className="flex w-full flex-col p-4">
              <Text size="lg" className="font-normal text-basic-primary">
                Méthode de paiement
              </Text>
              <Text
                className="font-normal text-secondary"
                data-testid="payment-method-summary"
              >
                Carte cadeau
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

export default Payment
