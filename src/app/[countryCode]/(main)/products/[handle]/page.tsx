import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProductByHandle } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import ProductTemplate from '@modules/products/templates'
import ProductJsonLd from '@modules/products/components/json-ld'
import { getBaseURL } from '@lib/util/env'

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  // A slow backend can resolve the region and then time out on the
  // product itself; treat that as a missing product rather than a 500.
  let product
  try {
    product = await getProductByHandle(handle, region.id)
  } catch {
    product = undefined
  }

  if (!product) {
    notFound()
  }

  const title = `${product.title} | WisLed`
  const description = product.description || `${product.title} - WisLed`
  const images = product.images?.map((img) => img.url) || (product.thumbnail ? [product.thumbnail] : [])
  const canonicalUrl = `${getBaseURL()}/${params.countryCode}/products/${handle}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images,
      url: canonicalUrl,
      type: 'website',        // Note: 'product' is not a valid OG type in Next.js Metadata API;
      // the correct signal for product pages is sent via JSON-LD instead.
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  // A slow backend can resolve the region and then time out on the
  // product itself; treat that as a missing product rather than a 500.
  let pricedProduct
  try {
    pricedProduct = await getProductByHandle(params.handle, region.id)
  } catch {
    pricedProduct = undefined
  }

  if (!pricedProduct) {
    notFound()
  }

  return (
    <>
      <ProductJsonLd
        product={pricedProduct}
        currencyCode={region.currency_code}
        countryCode={params.countryCode}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
