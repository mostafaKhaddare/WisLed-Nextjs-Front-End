import { getPaymentInfo, isManual } from '@lib/constants'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@medusajs/ui'
import { Box } from '@modules/common/components/box'

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const paymentInfo = getPaymentInfo(payment?.provider_id)
  const shippingMethod = order.shipping_methods?.[0]

  return (
    <Box className="bg-primary p-2">
      <Box className="p-4">
        <Text size="large">Mode de livraison</Text>
        <Text size="base" className="text-secondary">
          {shippingMethod?.name || 'Livraison à domicile'}
        </Text>
      </Box>

      <Box className="p-4">
        <Text size="large">Mode de paiement</Text>
        <Text size="base" className="text-secondary">
          {paymentInfo.title}
        </Text>
        {isManual(payment?.provider_id) && (
          <Text size="small" className="mt-1 text-secondary">
            Le paiement est effectué à la réception de votre commande.
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default PaymentDetails
