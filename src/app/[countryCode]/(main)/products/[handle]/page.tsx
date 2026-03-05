import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProductByHandle, getProductsList } from '@lib/data/products'
import { getRegion, listRegions } from '@lib/data/regions'
import ProductTemplate from '@modules/products/templates'
import ProductJsonLd from '@modules/products/components/json-ld'
import { getBaseURL } from '@lib/util/env'

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
  }

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({ countryCode })
    })
  ).then((responses) =>
    responses.map(({ response }) => response.products).flat()
  )

  const staticParams = countryCodes
    ?.map((countryCode) =>
      products.map((product) => ({
        countryCode,
        handle: product.handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  const title = `${product.title} | WisLed`
  const description = product.description || `${product.title} - WisLed`
  const images = product.images?.map((img) => img.url) || (product.thumbnail ? [product.thumbnail] : [])

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url: `${getBaseURL()}/${params.countryCode}/products/${handle}`,
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

  const pricedProduct = await getProductByHandle(params.handle, region.id)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <>
      <ProductJsonLd product={pricedProduct} region={region} currencyCode={region.currency_code} />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
