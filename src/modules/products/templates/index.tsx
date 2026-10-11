import { Suspense } from 'react'

import { retrieveCart } from '@lib/data/cart'
import { getProductVariantsColors } from '@lib/data/cms'
import { getProductsListByCollectionId, getProductsById } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import ImageGallery from '@modules/products/components/image-gallery'
import ProductTabs from '@modules/products/components/product-tabs'
import ProductInfo from '@modules/products/templates/product-info'
import SkeletonProductActions from '@modules/skeletons/components/skeleton-product-actions'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

import { NAVY } from '../components/product-tile/design-tokens'
import { ProductCarousel } from '../components/product-carousel'
import ProductBreadcrumbs from './breadcrumbs'
import ProductActionsWrapper from './product-actions-wrapper'

/**
 * Dark advice panel shown at the foot of a product page, after the related and
 * recommended carousels and before the footer. Navy card with a WhatsApp CTA.
 */
function ProjectAdviceCard() {
  return (
    <Container className="!py-8">
      <Box
        className="mx-4 flex flex-col gap-3 rounded-3xl p-5 small:mx-6 small:p-6"
        style={{ backgroundColor: NAVY }}
      >
        <Heading
          as="h3"
          className="font-sora text-[19px] font-semibold text-white"
        >
          Pas sûr du bon ruban ?
        </Heading>
        <Text className="font-jakarta text-sm leading-[1.5] text-[#C9D1E3]">
          Dites-nous la pièce et la longueur : on vous conseille la puissance,
          l&apos;alimentation et la teinte adaptées.
        </Text>

        <LocalizedClientLink
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-3xl bg-[#25D366] font-jakarta text-[15px] font-bold leading-none text-[#06260F] transition-colors hover:bg-[#1FBE5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B33]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06260F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" />
          </svg>
          Demander conseil sur WhatsApp
        </LocalizedClientLink>
      </Box>
    </Container>
  )
}

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

/**
 * Helper to parse a metadata field that may be a comma-separated string or an
 * array of product IDs, and return a clean string[].
 */
function parseMetadataIds(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (Array.isArray(value)) {
    return (value as string[]).map((s) => String(s).trim()).filter(Boolean)
  }
  return []
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}: ProductTemplateProps) => {
  const variantsColors = await getProductVariantsColors()

  // ── 1. INCLUDED PRODUCTS ────────────────────────────────────────────────────
  // Metadata key: "included_products"
  // These are items physically bundled with / included in this product.
  const includedIds = parseMetadataIds(product.metadata?.included_products)
  const includedProductsList = includedIds.length
    ? await getProductsById({ ids: includedIds, regionId: region.id })
    : []

  // ── 2. RELATED PRODUCTS ──────────────────────────────────────────────────────
  // Metadata key: "related_products"
  // These are curated companion / suitable products manually chosen in the admin.
  // Falls back to same-collection products if no related_products metadata is set.
  const relatedIds = parseMetadataIds(product.metadata?.related_products)

  let relatedProductsList: HttpTypes.StoreProduct[] = []
  if (relatedIds.length > 0) {
    relatedProductsList = await getProductsById({ ids: relatedIds, regionId: region.id })
  } else if (product.collection_id) {
    const { response: productsList } = await getProductsListByCollectionId({
      collectionId: product.collection_id,
      countryCode,
      excludeProductId: product.id,
    })
    relatedProductsList = productsList.products
  }

  const cart = await retrieveCart()

  // "Nouveau" badge on the hero shot, same 7-day window the cards use.
  const isNew =
    (Date.now() - new Date(product.created_at!).getTime()) /
      (1000 * 3600 * 24) <=
    7

  return (
    <>
      <Container
        className="relative flex flex-col gap-y-6 !py-8 small:gap-y-12"
        data-testid="product-container"
      >
        <ProductBreadcrumbs product={product} countryCode={countryCode} />
        <Box className="relative flex flex-col gap-y-6 large:flex-row large:items-start large:gap-x-8 xl:gap-x-[120px]">
          <Box className="relative block w-full">
            <ImageGallery
              title={product.title}
              images={product?.images || []}
              productHandle={product.handle}
              regionId={region.id}
              thumbnail={product.thumbnail}
              productId={product.id}
              isNew={isNew}
            />
          </Box>
          <Box className="flex w-full flex-col gap-y-4 py-8 large:sticky large:top-24 large:max-w-[550px] large:py-0">
            <ProductInfo product={product} />
            <Suspense fallback={<SkeletonProductActions />}>
              <ProductActionsWrapper
                id={product.id}
                region={region}
                cartItems={cart?.items}
                colors={variantsColors.data}
              />
            </Suspense>
            <ProductTabs product={product} />
          </Box>
        </Box>
      </Container>

      {/* ── INCLUDED PRODUCTS ── */}
      {includedProductsList.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={includedProductsList}
            regionId={region.id}
            title="Articles inclus avec ce produit"
          />
        </Suspense>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {relatedProductsList.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={relatedProductsList}
            regionId={region.id}
            title="Produits similaires & compatibles"
          />
        </Suspense>
      )}

      {/* ── CONSEIL WHATSAPP ── */}
      <ProjectAdviceCard />
    </>
  )
}

export default ProductTemplate
