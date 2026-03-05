import { Suspense } from 'react'

import { retrieveCart } from '@lib/data/cart'
import { getProductVariantsColors } from '@lib/data/fetch'
import { getProductsListByCollectionId, getProductsById } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import ImageGallery from '@modules/products/components/image-gallery'
import ProductTabs from '@modules/products/components/product-tabs'
import ProductInfo from '@modules/products/templates/product-info'
import SkeletonProductActions from '@modules/skeletons/components/skeleton-product-actions'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

import { ProductCarousel } from '../components/product-carousel'
import ProductBreadcrumbs from './breadcrumbs'
import ProductActionsWrapper from './product-actions-wrapper'

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
    </>
  )
}

export default ProductTemplate
