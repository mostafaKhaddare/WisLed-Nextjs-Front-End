import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { enrichLineItems } from '@lib/data/cart'
import { retrieveOrder } from '@lib/data/orders'
import { HttpTypes } from '@medusajs/types'
import { OrderType } from '@modules/account/components/order-overview'
import OrderCompletedTemplate from '@modules/order/templates/order-completed-template'

type Props = {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

export const metadata: Metadata = {
  title: 'Commande Confirmée | Wisled',
  description: 'Votre commande a été validée avec succès. Merci de faire confiance à Wisled pour vos solutions d’éclairage.',
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await getOrder(params.id)
  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order as OrderType} />
}
