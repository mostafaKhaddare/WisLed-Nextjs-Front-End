'use client'

import React, { useRef, useState } from 'react'

import { isManual, isPaypal, isStripe } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { findActivePaymentSession } from '@lib/util/payment-session'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import { Spinner } from '@modules/common/icons'
import { OnApproveActions, OnApproveData } from '@paypal/paypal-js'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import ErrorMessage from '../error-message'

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  'data-testid': string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  'data-testid': dataTestId,
}) => {
  const paymentSession = findActivePaymentSession(
    cart?.payment_collection?.payment_sessions
  )

  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1 ||
    !paymentSession

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          providerId={paymentSession?.provider_id}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return (
        <Button disabled className="w-full" data-testid={dataTestId}>
          Choisissez un mode de paiement
        </Button>
      )
  }
}

// const GiftCardPaymentButton = () => {
//   const [submitting, setSubmitting] = useState(false)

//   const handleOrder = async () => {
//     setSubmitting(true)
//     await placeOrder()
//   }

//   return (
//     <Button
//       onClick={handleOrder}
//       isLoading={submitting}
//       data-testid="submit-order-button"
//     >
//       Place order
//     </Button>
//   )
// }

const StripePaymentButton = ({
  cart,
  providerId,
  notReady,
  'data-testid': dataTestId,
}: {
  cart: HttpTypes.StoreCart
  providerId: string
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        submittingRef.current = false
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()

  const session = findActivePaymentSession(
    cart?.payment_collection?.payment_sessions
  )

  const clientSecret = session?.data?.client_secret as string | undefined
  const disabled = !stripe || !elements || !clientSecret

  const handlePayment = async () => {
    if (submitting || submittingRef.current) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)

    const card = elements?.getElement('card')

    if (!stripe || !elements || !card || !cart || !clientSecret) {
      submittingRef.current = false
      setSubmitting(false)
      setErrorMessage(
        'Le paiement par carte est indisponible. Veuillez choisir un autre mode de paiement.'
      )
      return
    }

    if (providerId === 'pp_stripe_stripe') {
      await stripe
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name:
                cart.billing_address?.first_name +
                ' ' +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        })
        .then(async ({ error, paymentIntent }) => {
          if (error) {
            const pi = error.payment_intent

            if (
              (pi && pi.status === 'requires_capture') ||
              (pi && pi.status === 'succeeded')
            ) {
              await onPaymentCompleted()
              return
            }

            submittingRef.current = false
            setSubmitting(false)
            setErrorMessage(
              error.message ||
                'Le paiement par carte a échoué. Veuillez réessayer.'
            )
            return
          }

          if (
            (paymentIntent && paymentIntent.status === 'requires_capture') ||
            paymentIntent.status === 'succeeded'
          ) {
            return onPaymentCompleted()
          }

          submittingRef.current = false
          setSubmitting(false)
          return
        })
    } else {
      // TODO: Adjust for another Stripe methods
      await stripe
        .confirmPayment({
          clientSecret,
          elements,
          redirect: 'if_required',
          confirmParams: {
            return_url: window.location.href,
          },
        })
        .then(async ({ error }) => {
          if (error) {
            submittingRef.current = false
            setSubmitting(false)
            setErrorMessage(
              error.message ||
                'Le paiement a échoué. Veuillez réessayer ou choisir un autre mode de paiement.'
            )
            return
          }
          onPaymentCompleted()
        })
    }
  }

  return (
    <>
      {clientSecret && providerId !== 'pp_stripe_stripe' && (
        <PaymentElement key={clientSecret} />
      )}
      <Button
        className="w-full"
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Confirmer la commande
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
  'data-testid': dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        submittingRef.current = false
        setSubmitting(false)
      })
  }

  const session = findActivePaymentSession(
    cart?.payment_collection?.payment_sessions
  )

  const handlePayment = async (
    _data: OnApproveData,
    actions: OnApproveActions
  ) => {
    if (submitting || submittingRef.current) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)

    actions?.order
      ?.authorize()
      .then((authorization) => {
        if (authorization.status !== 'COMPLETED') {
          submittingRef.current = false
          setSubmitting(false)
          setErrorMessage(
            `Le paiement PayPal n'a pas abouti (statut : ${authorization.status}).`
          )
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        submittingRef.current = false
        setSubmitting(false)
        setErrorMessage('Une erreur PayPal est survenue. Veuillez réessayer.')
      })
  }

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />
  }

  if (isResolved) {
    return (
      <>
        <PayPalButtons
          style={{ layout: 'horizontal' }}
          createOrder={async () => session?.data.id as string}
          onApprove={handlePayment}
          disabled={notReady || submitting || isPending}
          data-testid={dataTestId}
        />
        <ErrorMessage
          error={errorMessage}
          data-testid="paypal-payment-error-message"
        />
      </>
    )
  }
}

const ManualPaymentButton = ({
  notReady,
  'data-testid': dataTestId,
}: {
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "La commande n'a pas pu être enregistrée. Veuillez réessayer."
      )
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    if (notReady || submittingRef.current) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)
    void onPaymentCompleted()
  }

  return (
    <>
      <Button
        className="w-full"
        disabled={notReady || submitting}
        isLoading={submitting}
        onClick={handlePayment}
        data-testid={dataTestId || 'submit-order-button'}
      >
        Confirmer la commande
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
