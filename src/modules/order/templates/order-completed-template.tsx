import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import CartTotals from '@modules/common/components/cart-totals'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import {
  CheckCircleIcon,
  HeadphonesIcon,
  ShippingIcon,
  WhatsappIcon,
} from '@modules/common/icons'
import Items from '@modules/order/components/items'
import { convertToLocale } from '@lib/util/money'
import { getPaymentInfo, isManual } from '@lib/constants'

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder & { status: string }
}

const formatDate = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date()
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const orderNumber = (order: HttpTypes.StoreOrder) =>
  order.display_id
    ? `#${order.display_id}`
    : `#${order.id.slice(-8).toUpperCase()}`

const itemCount = (order: HttpTypes.StoreOrder) =>
  (order.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  )

const addressLines = (address?: HttpTypes.StoreOrderAddress | null) => {
  if (!address) return []

  const cityLine = [address.postal_code, address.city].filter(Boolean).join(' ')

  return [
    address.company,
    address.address_1,
    address.address_2,
    cityLine,
    address.country_code?.toUpperCase(),
  ].filter(Boolean) as string[]
}

export default function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const number = orderNumber(order)
  const count = itemCount(order)
  const currency = order.currency_code
  const shipping = order.shipping_address
  const paymentCollection = order.payment_collections?.[0]
  const payment =
    paymentCollection?.payments?.[0] ||
    (paymentCollection as any)?.payment_sessions?.[0]
  const paymentInfo = getPaymentInfo(payment?.provider_id)
  const cod = isManual(payment?.provider_id)
  const customerName = [shipping?.first_name, shipping?.last_name]
    .filter(Boolean)
    .join(' ')
  const shippingName =
    order.shipping_methods?.[0]?.name || 'Livraison à domicile'
  const downloadHref = order.email
    ? `/api/orders/${order.id}/confirmation?email=${encodeURIComponent(
        order.email
      )}`
    : null
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Bonjour WisLed, je souhaite suivre ma commande ${number}.`
      )}`
    : null

  return (
    <Box className="bg-secondary min-h-[calc(100svh-4rem)]">
      {/* ── Hero confirmation ── */}
      <Box className="bg-gradient-to-b from-[#eff6ff] to-secondary border-b border-[#dbeafe]">
        <Container maxWidth="lg" className="px-4 py-12 small:px-6 small:py-16">
          <Box className="mx-auto max-w-2xl text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border border-[#1d4ed8] bg-white shadow-[0_20px_50px_rgba(29,78,216,0.12)]">
              <CheckCircleIcon className="h-12 w-12 text-[#1d4ed8]" />
            </div>

            <Text
              className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4ed8]"
            >
              Commande confirmée
            </Text>
            <Heading
              as="h1"
              className="mt-3 text-3xl font-bold tracking-tight text-basic-primary small:text-5xl"
            >
              Merci {customerName ? `${customerName} !` : 'pour votre commande !'}
            </Heading>
            <Text className="mt-5 max-w-xl text-base leading-8 text-secondary">
              Votre commande
              <span className="font-bold text-basic-primary">{number}</span>{' '}
              a bien été enregistrée. Notre équipe vous contactera pour confirmer la livraison.
            </Text>

            {order.email && (
              <Box className="mt-6 flex items-center justify-center gap-3">
                <span className="h-1 w-1 rounded-full bg-[#1d4ed8]" />
                <Text className="text-sm text-secondary">
                  Une confirmation détaillée a été envoyée à{' '}
                  <span className="font-medium text-basic-primary">
                    {order.email}
                  </span>{' '}
                  .
                </Text>
              </Box>
            )}

            <Box className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/90 px-4 py-2 text-xs font-medium text-[#1e3a8a] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                {formatDate(order.created_at)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/90 px-4 py-2 text-xs font-medium text-[#1e3a8a] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                {count} {count > 1 ? 'articles' : 'article'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/90 px-4 py-2 text-xs font-medium text-[#1e3a8a] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                {paymentInfo.title}
              </span>
            </Box>

            <Box className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {downloadHref && (
                <a
                  href={downloadHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1e40af] transition-colors sm:w-auto"
                >
                  Télécharger ma confirmation PDF
                </a>
              )}
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-white px-8 py-3.5 text-sm font-semibold text-[#1d4ed8] hover:bg-[#eff6ff] transition-colors sm:w-auto"
              >
                Continuer mes achats
              </LocalizedClientLink>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Order details ── */}
      <Container maxWidth="lg" className="px-4 py-12 small:px-6 small:py-16">
        <Box className="grid grid-cols-1 items-start gap-8 small:gap-12 large:grid-cols-[minmax(0,1fr)_400px]">
          <Box className="flex flex-col gap-8">
            {/* COD info card */}
            {cod && (
              <Box className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-6">
                <Box className="flex items-start gap-3">
<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#fde68a] bg-[#fef3c7]">
  <HeadphonesIcon className="h-5 w-5 text-[#92400e]" />
</div>
                  <Box>
                    <Text className="text-sm font-semibold text-[#92400e]">
                      Paiement à la livraison
                    </Text>
                    <Text className="mt-1 text-sm leading-6 text-[#92400e]/80">
                      Vous réglerez le montant de{' '}
                      {convertToLocale({
                        amount: order.total,
                        currency_code: currency,
                      })}{' '}
                      en espèces lors de la réception de votre commande.
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Items */}
            <Box className="overflow-hidden rounded-2xl border border-[#e8edf4] bg-primary">
              <Box className="flex flex-col gap-1 border-b border-[#e8edf4] px-5 py-4 small:flex-row small:items-end small:justify-between">
                <Box>
                  <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    Votre commande
                  </Text>
                  <Heading
                    as="h2"
                    className="mt-1 text-xl font-bold text-basic-primary"
                  >
                    Les articles sélectionnés
                  </Heading>
                </Box>
                <Text className="text-sm text-secondary">
                  {count} {count > 1 ? 'articles' : 'article'}
                </Text>
              </Box>

              <Items items={order.items} />

              <Box className="border-t border-[#e8edf4] p-5">
                <CartTotals totals={order} />
              </Box>
            </Box>

            {/* Delivery & payment cards */}
            <Box className="grid grid-cols-1 gap-5 medium:grid-cols-2">
              <Box className="rounded-2xl border border-[#e8edf4] bg-primary p-6">
                <Box className="mb-4 flex items-center gap-3">
                  <ShippingIcon className="h-5 w-5 text-[#1d4ed8]" />
                  <Text className="text-sm font-bold text-basic-primary">
                    Livraison
                  </Text>
                </Box>
                <Text className="text-sm font-medium text-basic-primary">
                  {customerName || 'Client WisLed'}
                </Text>
                {addressLines(shipping).map((line) => (
                  <Text
                    key={line}
                    className="mt-1 text-sm leading-6 text-secondary"
                  >
                    {line}
                  </Text>
                ))}
                <Box className="mt-5 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#dbeafe]" />
                  <Text className="text-xs font-medium uppercase tracking-[0.12em] text-secondary">
                    {shippingName}
                  </Text>
                </Box>
              </Box>

              <Box className="rounded-2xl border border-[#e8edf4] bg-primary p-6">
                <Box className="mb-4 flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-[#1d4ed8]" />
                  <Text className="text-sm font-bold text-basic-primary">
                    Paiement
                  </Text>
                </Box>
                <Text className="text-sm font-medium text-basic-primary">
                  {paymentInfo.title}
                </Text>
                {paymentInfo.description && (
                  <Text className="mt-1 text-sm leading-6 text-secondary">
                    {paymentInfo.description}
                  </Text>
                )}
                <Box className="mt-5 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#dbeafe]" />
                  <Text className="text-xs font-medium uppercase tracking-[0.12em] text-secondary">
                    Total réglé
                  </Text>
                </Box>
                <Text className="mt-1 text-lg font-bold text-[#1d4ed8]">
                  {convertToLocale({
                    amount: order.total,
                    currency_code: currency,
                  })}
                </Text>
              </Box>
            </Box>

            {/* Next steps */}
            <Box className="rounded-2xl border border-[#e8edf4] bg-primary p-6 small:p-8">
              <Heading
                as="h2"
                className="text-xl font-bold text-basic-primary"
              >
                Et maintenant ?
              </Heading>
              <Box className="mt-6 flex flex-col gap-5">
                {[
                  {
                    title: 'Nous préparons votre commande',
                    text: 'Notre équipe vérifie les articles et prépare votre colis avec soin.',
                  },
                  {
                    title: 'Nous vous contactons',
                    text: 'Nous vous appelons pour confirmer l’adresse et le créneau de livraison.',
                  },
                  {
                    title: 'Vous recevez votre commande',
                    text: cod
                      ? 'Le paiement est effectué à la réception, directement auprès du livreur.'
                      : 'Votre commande est livrée à l’adresse indiquée.',
                  },
                ].map((step, index) => (
                  <Box
                    key={step.title}
                    className="flex items-start gap-3.5"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-xs font-bold text-[#1d4ed8]">
                      {index + 1}
                    </span>
                    <Box>
                      <Text className="text-sm font-bold text-basic-primary">
                        {step.title}
                      </Text>
                      <Text className="mt-1 text-sm leading-6 text-secondary">
                        {step.text}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right sidebar */}
          <Box className="flex flex-col gap-6 large:sticky large:top-8">
            {/* Summary card */}
            <Box className="rounded-2xl border border-[#e8edf4] bg-primary p-6">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                Récapitulatif
              </Text>
              <Heading
                as="h2"
                className="mt-2 text-2xl font-bold text-basic-primary"
              >
                {number}
              </Heading>

              <Box className="mt-6 divide-y divide-[#e8edf4]">
                <Box className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <Text className="text-sm text-secondary">Date</Text>
                  <Text className="text-sm font-medium text-basic-primary">
                    {formatDate(order.created_at)}
                  </Text>
                </Box>
                <Box className="flex items-center justify-between gap-4 py-4">
                  <Text className="text-sm text-secondary">Paiement</Text>
                  <Text className="text-right text-sm font-medium text-basic-primary">
                    {paymentInfo.title}
                  </Text>
                </Box>
                <Box className="flex items-center justify-between gap-4 py-4">
                  <Text className="text-sm text-secondary">Livraison</Text>
                  <Text className="text-right text-sm font-medium text-basic-primary">
                    {shippingName}
                  </Text>
                </Box>
                <Box className="flex items-center justify-between gap-4 py-4">
                  <Text className="text-sm text-secondary">Total</Text>
                  <Text className="text-lg font-bold text-[#1d4ed8]">
                    {convertToLocale({
                      amount: order.total,
                      currency_code: currency,
                    })}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Support */}
            <Box className="rounded-2xl border border-[#e8edf4] bg-primary p-6">
              <Text className="text-sm font-bold text-basic-primary">
                Besoin d’aide ?
              </Text>
              <Text className="mt-1 text-sm leading-6 text-secondary">
                Notre équipe est disponible pour répondre à vos questions sur cette commande.
              </Text>
              <Box className="mt-5 flex flex-col gap-2.5">
                {order.email && (
                  <a
                    href={`mailto:contact@wisled.ma?subject=${encodeURIComponent(
                      `Commande ${number}`
                    )}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[#dbeafe] px-4 py-3 text-sm font-semibold text-[#1d4ed8] hover:bg-[#eff6ff] transition-colors"
                  >
                    Écrire à WisLed
                  </a>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbeafe] px-4 py-3 text-sm font-semibold text-[#1d4ed8] hover:bg-[#eff6ff] transition-colors"
                  >
                    <WhatsappIcon className="h-4 w-4" />
                    Suivre sur WhatsApp
                  </a>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
