import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

import { ProductTile } from '../product-tile'
import CarouselWrapper from './carousel-wrapper'

interface ViewAllProps {
  link: string
  text?: string
}

interface ProductCarouselProps {
  products: StoreProduct[]
  regionId: string
  title: string
  viewAll?: ViewAllProps
  testId?: string
}

export function ProductCarousel({
  products,
  regionId,
  title,
  viewAll,
  testId,
}: ProductCarouselProps) {
  return (
    <Container className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 overflow-x-auto" data-testid={testId}>
      <Box className="flex flex-col gap-6 small:gap-12">
        <CarouselWrapper title={title} productsCount={products.length}>
          <Box className="flex gap-2">
            {products.map((item, index) => {
              const cheapestVariant = getProductPrice({
                product: item,
              })

              return (
                <Box
                  // Basis is fixed on touch so the card is a true 220px wide —
                  // the width the design mock uses — then switches to the
                  // fluid per-breakpoint fractions once the viewport is wide
                  // enough for several cards.
                  className="flex-[0_0_220px] small:flex-[0_0_calc(50%-8px)] medium:flex-[0_0_calc(33.333%-8px)] large:flex-[0_0_calc(25%-12px)] xl:flex-[0_0_calc(25%-12px)] 2xl:flex-[0_0_calc(20%-12px)]"
                  key={item.id}
                >
                  <ProductTile
                    product={{
                      id: item.id,
                      created_at: item.created_at,
                      title: item.title,
                      handle: item.handle,
                      thumbnail: item.thumbnail,
                      calculatedPrice:
                        cheapestVariant.cheapestPrice.calculated_price,
                      salePrice: cheapestVariant.cheapestPrice.original_price,
                      // Pass full variants/options if available on item, or ensure ProductTile handles partial data
                      // Note: getProductsList returns StoreProduct which has variants.
                      variants: item.variants,
                      options: item.options,
                    }}
                    regionId={regionId}
                    layout="carousel"
                    priority={index < 2}
                  />
                </Box>
              )
            })}
          </Box>
        </CarouselWrapper>
        {viewAll && (
          <Button asChild>
            <LocalizedClientLink
              href={viewAll.link}
              className="mx-auto w-max !px-5 !py-3"
            >
              {viewAll.text || 'Voir tout'}
            </LocalizedClientLink>
          </Button>
        )}
      </Box>
    </Container>
  )
}
