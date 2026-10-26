import React from 'react'

import { getBaseURL } from '@lib/util/env'
import {
  getProductAvailability,
  getVariantAvailability,
  VariantAvailability,
} from '@lib/util/product-availability'
import { HttpTypes } from '@medusajs/types'

type ProductJsonLdProps = {
  product: HttpTypes.StoreProduct
  currencyCode: string
  countryCode: string
}

type PricedVariant = {
  variant: HttpTypes.StoreProductVariant
  amount: number
  currencyCode: string
}

const AVAILABILITY_URL: Record<VariantAvailability, string> = {
  'in-stock': 'https://schema.org/InStock',
  backorder: 'https://schema.org/BackOrder',
  'out-of-stock': 'https://schema.org/OutOfStock',
}

const formatAmount = (amount: number) => amount.toFixed(2)

export default function ProductJsonLd({
  product,
  currencyCode,
  countryCode,
}: ProductJsonLdProps) {
  const baseUrl = getBaseURL()
  const productUrl = `${baseUrl}/${countryCode}/products/${product.handle}`
  const productAvailability = getProductAvailability(product)

  /**
   * Only variants with a real calculated price can become an Offer. The
   * price is kept as a number and formatted with two decimals for Schema,
   * instead of parsing a localized display string such as "150,00 MAD".
   */
  const pricedVariants: PricedVariant[] = (product.variants ?? []).flatMap(
    (variant) => {
      const amount = variant.calculated_price?.calculated_amount
      const variantCurrency = variant.calculated_price?.currency_code

      if (typeof amount !== 'number' || !Number.isFinite(amount)) {
        return []
      }

      return [
        {
          variant,
          amount,
          currencyCode: (variantCurrency || currencyCode).toUpperCase(),
        },
      ]
    }
  )

  const offerCurrency =
    pricedVariants[0]?.currencyCode || currencyCode.toUpperCase()
  const offersInCurrency = pricedVariants.filter(
    (entry) => entry.currencyCode === offerCurrency
  )
  const prices = offersInCurrency.map((entry) => entry.amount)

  const images = (product.images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url))
  if (!images.length && product.thumbnail) {
    images.push(product.thumbnail)
  }

  const seller = {
    '@type': 'Organization',
    name: 'WisLed',
  }

  const singleVariant =
    offersInCurrency.length === 1 ? offersInCurrency[0] : undefined

  /**
   * A single variant gets a precise Offer. A product with several variants
   * gets an AggregateOffer whose availability reflects the strongest state
   * among its purchasable variants: InStock when any variant is in stock,
   * BackOrder when only backorders remain. This mirrors the product page,
   * where the buyer can pick a different variant, and avoids reporting the
   * whole product as sold out because one variant has no stock.
   */
  const offers = singleVariant
    ? {
        '@type': 'Offer',
        priceCurrency: offerCurrency,
        price: formatAmount(singleVariant.amount),
        availability:
          AVAILABILITY_URL[getVariantAvailability(singleVariant.variant)],
        itemCondition: 'https://schema.org/NewCondition',
        url: productUrl,
        seller,
      }
    : prices.length
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: offerCurrency,
          lowPrice: formatAmount(Math.min(...prices)),
          highPrice: formatAmount(Math.max(...prices)),
          offerCount: prices.length,
          availability: AVAILABILITY_URL[productAvailability],
          itemCondition: 'https://schema.org/NewCondition',
          url: productUrl,
          seller,
        }
      : undefined

  // Keep this object limited to public product facts. Inventory quantities are
  // intentionally never serialized into structured data.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.description || product.title,
    ...(images.length ? { image: images } : {}),
    ...(singleVariant?.variant.sku ? { sku: singleVariant.variant.sku } : {}),
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'WisLed',
    },
    ...(offers ? { offers } : {}),
  }

  // Escape `<` so a CMS title or description containing `</script>` cannot
  // terminate the JSON-LD block and inject markup into the page.
  const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
    />
  )
}
