import 'server-only'

import { getPaymentInfo } from '@lib/constants'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import { Resend } from 'resend'

import {
  generateOrderConfirmationPdf,
  getOrderNumber,
  orderConfirmationFileName,
} from './pdf'

type OrderWithDetails = HttpTypes.StoreOrder & {
  items?: HttpTypes.StoreOrderLineItem[] | null
}

type SendResult = {
  sent: boolean
  id?: string
  reason?: string
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const formatMoney = (amount: number | null | undefined, currency: string) =>
  convertToLocale({
    amount: Number(amount || 0),
    currency_code: currency,
    locale: 'fr-MA',
  })

const formatDate = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const productTitle = (item: HttpTypes.StoreOrderLineItem) => {
  const lineItem = item as HttpTypes.StoreOrderLineItem & {
    product_title?: string
  }
  return lineItem.product_title || lineItem.title || 'Produit'
}

const productVariant = (item: HttpTypes.StoreOrderLineItem) => {
  const lineItem = item as HttpTypes.StoreOrderLineItem & {
    variant_title?: string
    variant?: { title?: string }
  }
  return lineItem.variant_title || lineItem.variant?.title || ''
}

const buildEmailHtml = (order: OrderWithDetails) => {
  const currency = order.currency_code
  const number = getOrderNumber(order)
  const shipping = order.shipping_address
  const payment =
    order.payment_collections?.[0]?.payments?.[0] ||
    order.payment_collections?.[0]?.payment_sessions?.[0]
  const paymentName = getPaymentInfo(payment?.provider_id).title
  const shippingName = order.shipping_methods?.[0]?.name || 'Livraison à domicile'
  const customerName = [shipping?.first_name, shipping?.last_name]
    .filter(Boolean)
    .join(' ')

  const addressLines = [
    shipping?.company,
    shipping?.address_1,
    shipping?.address_2,
    [shipping?.postal_code, shipping?.city].filter(Boolean).join(' '),
    shipping?.country_code?.toUpperCase(),
  ].filter(Boolean)

  const itemsRows = (order.items || [])
    .map((item) => {
      const quantity = Number(item.quantity || 0)
      const total = Number(item.total || 0)
      const unit = Number(
        item.unit_price ?? (quantity ? total / quantity : 0)
      )
      const variant = productVariant(item)

      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #e8edf4;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(
              productTitle(item)
            )}</div>
            ${
              variant
                ? `<div style="font-size:12px;color:#64748b;margin-top:3px;">${escapeHtml(
                    variant
                  )}</div>`
                : ''
            }
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8edf4;text-align:center;font-size:13px;color:#334155;">${quantity}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8edf4;text-align:right;font-size:13px;color:#334155;white-space:nowrap;">${formatMoney(
            unit,
            currency
          )}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8edf4;text-align:right;font-size:13px;font-weight:700;color:#0f172a;white-space:nowrap;">${formatMoney(
            total,
            currency
          )}</td>
        </tr>
      `
    })
    .join('')

  const discount = Number(order.discount_total || 0)
  const tax = Number(order.tax_total || 0)
  const shippingTotal = Number(order.shipping_total || 0)

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Confirmation de commande ${escapeHtml(number)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8edf4;">
            <tr>
              <td style="background:#1d4ed8;padding:28px 28px 24px;">
                <div style="font-size:24px;font-weight:800;letter-spacing:0.04em;color:#ffffff;">WISLED</div>
                <div style="font-size:11px;letter-spacing:0.14em;color:#dbeafe;margin-top:4px;">LUMIÈRE LED &amp; SOLUTIONS</div>
                <div style="font-size:17px;font-weight:700;color:#ffffff;margin-top:22px;">Votre commande est confirmée</div>
                <div style="font-size:13px;color:#dbeafe;margin-top:5px;">Commande ${escapeHtml(
                  number
                )} · ${escapeHtml(formatDate(order.created_at))}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 12px;font-size:15px;line-height:1.65;">Bonjour ${
                  escapeHtml(customerName) || 'cher client'
                },</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569;">
                  Merci pour votre confiance. Nous avons bien reçu votre commande et notre équipe la prépare avec soin.
                  Vous trouverez votre confirmation détaillée en PDF ci-joint.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px;">
                  <tr>
                    <td style="width:50%;padding:0 8px 0 0;vertical-align:top;">
                      <div style="background:#f8fafc;border:1px solid #e8edf4;border-radius:12px;padding:14px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Livraison</div>
                        <div style="font-size:13px;line-height:1.6;color:#334155;margin-top:6px;">
                          ${escapeHtml(customerName)}<br />
                          ${addressLines.map((line) => escapeHtml(line)).join('<br />')}
                        </div>
                      </div>
                    </td>
                    <td style="width:50%;padding:0 0 0 8px;vertical-align:top;">
                      <div style="background:#f8fafc;border:1px solid #e8edf4;border-radius:12px;padding:14px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Paiement</div>
                        <div style="font-size:13px;line-height:1.6;color:#334155;margin-top:6px;">
                          ${escapeHtml(paymentName)}<br />
                          ${escapeHtml(shippingName)}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin:0 0 18px;">
                  <thead>
                    <tr style="background:#f8fafc;">
                      <th align="left" style="padding:10px 12px;font-size:10px;letter-spacing:0.08em;color:#64748b;">PRODUIT</th>
                      <th align="center" style="padding:10px 12px;font-size:10px;letter-spacing:0.08em;color:#64748b;">QTÉ</th>
                      <th align="right" style="padding:10px 12px;font-size:10px;letter-spacing:0.08em;color:#64748b;">P.U.</th>
                      <th align="right" style="padding:10px 12px;font-size:10px;letter-spacing:0.08em;color:#64748b;">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>${itemsRows}</tbody>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-left:auto;max-width:280px;">
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#64748b;">Sous-total</td>
                    <td align="right" style="padding:4px 0;font-size:13px;color:#334155;">${formatMoney(
                      order.item_subtotal ?? order.subtotal,
                      currency
                    )}</td>
                  </tr>
                  ${
                    shippingTotal
                      ? `<tr>
                          <td style="padding:4px 0;font-size:13px;color:#64748b;">Livraison</td>
                          <td align="right" style="padding:4px 0;font-size:13px;color:#334155;">${formatMoney(
                            shippingTotal,
                            currency
                          )}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    discount
                      ? `<tr>
                          <td style="padding:4px 0;font-size:13px;color:#64748b;">Remise</td>
                          <td align="right" style="padding:4px 0;font-size:13px;color:#16a34a;">-${formatMoney(
                            discount,
                            currency
                          )}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    tax
                      ? `<tr>
                          <td style="padding:4px 0;font-size:13px;color:#64748b;">TVA</td>
                          <td align="right" style="padding:4px 0;font-size:13px;color:#334155;">${formatMoney(
                            tax,
                            currency
                          )}</td>
                        </tr>`
                      : ''
                  }
                  <tr>
                    <td style="padding:12px 0 0;border-top:1px solid #e8edf4;font-size:14px;font-weight:700;">Total</td>
                    <td align="right" style="padding:12px 0 0;border-top:1px solid #e8edf4;font-size:16px;font-weight:800;color:#1d4ed8;">${formatMoney(
                      order.total,
                      currency
                    )}</td>
                  </tr>
                </table>

                <div style="margin:26px 0 0;padding:16px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;">
                  <div style="font-size:13px;font-weight:700;color:#1e3a8a;margin-bottom:6px;">Et maintenant ?</div>
                  <div style="font-size:13px;line-height:1.7;color:#334155;">
                    Notre équipe vous contactera pour confirmer la livraison. Le paiement est effectué à la réception de votre commande.
                  </div>
                </div>

                <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#475569;">
                  Une question ? Répondez à cet email ou écrivez-nous à
                  <a href="mailto:contact@wisled.ma" style="color:#1d4ed8;text-decoration:none;font-weight:700;">contact@wisled.ma</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#0f172a;padding:18px 28px;text-align:center;">
                <div style="font-size:11px;color:#94a3b8;">WISLED · Éclairage LED professionnel · www.wisled.ma</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendOrderConfirmationEmail(
  order: OrderWithDetails
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from =
    process.env.RESEND_FROM_EMAIL || 'WisLed <contact@wisled.ma>'

  if (!apiKey || apiKey === 're_PASTE_YOUR_KEY_HERE') {
    console.warn(
      '[Order confirmation] RESEND_API_KEY is not configured; email not sent.'
    )
    return { sent: false, reason: 'missing_api_key' }
  }

  if (!order.email) {
    console.warn(
      `[Order confirmation] Order ${order.id} has no email; email not sent.`
    )
    return { sent: false, reason: 'missing_customer_email' }
  }

  const pdf = await generateOrderConfirmationPdf(order)
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send(
    {
      from,
      to: [order.email],
      replyTo: 'contact@wisled.ma',
      subject: `Votre commande ${getOrderNumber(order)} est confirmée - WisLed`,
      html: buildEmailHtml(order),
      attachments: [
        {
          filename: orderConfirmationFileName(order),
          content: Buffer.from(pdf),
        },
      ],
      tags: [
        { name: 'type', value: 'order-confirmation' },
        { name: 'order', value: order.id },
      ],
    },
    {
      idempotencyKey: `order-confirmation-${order.id}`,
    }
  )

  if (error) {
    console.error('[Order confirmation] Resend error:', error)
    return { sent: false, reason: error.name || 'resend_error' }
  }

  return { sent: true, id: data?.id }
}
