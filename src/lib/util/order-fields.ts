/**
 * Fields required by the confirmation page, the PDF and the confirmation
 * email. Listing them explicitly is safer than relying on `*`, which does not
 * guarantee that every nested relation used by the PDF is expanded.
 */
export const ORDER_CONFIRMATION_FIELDS = [
  '*items',
  '*shipping_methods',
  '*shipping_address',
  '*billing_address',
  '*payment_collections.payments',
  '+fulfillment_status',
].join(',')
