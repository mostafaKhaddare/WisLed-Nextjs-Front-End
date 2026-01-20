interface ViewAllProps {
  link: string
  text?: string
}
import { StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Button } from '@modules/common/components/button'
import { CategoryTile } from '../category-tile'
import CarouselWrapper from './carousel-wrapper'

interface CategoryCarouselProps {
  categories: StoreProductCategory[]
  title: string

   viewAll?: ViewAllProps
  testId?: string
}

export function CategoryCarousel({
  categories,
  title,
  viewAll,
  testId,
}: CategoryCarouselProps) {
  const displayCategories = categories
    .filter((item) => !item.parent_category)
    .map((item) => {
      const image = (item as any).product_category_image?.[0] || null
      return {
        id: item.id,
        created_at: item.created_at,
        title: item.name,
        handle: item.handle,
        thumbnail: (image?.url as string) || '',
      }
    })
    .filter((it) => Boolean(it.thumbnail))

  return (
    <Container
      className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 overflow-x-auto"
      data-testid={testId}
    >
      <Box className="flex flex-col gap-4 small:gap-12">
        <CarouselWrapper title={title} categoryCount={displayCategories.length}>
          <Box className="flex gap-2">
            {displayCategories.map((item, index) => {
              return (
                <Box
                  className="flex-[0_0_calc(72.666%-8px)] small:flex-[0_0_calc(62.666%-8px)] medium:flex-[0_0_calc(42.666%-8px)] xl:flex-[0_0_calc(33.333%-8px)] 2xl:flex-[0_0_calc(30.333%-8px)]"
                  key={index}
                >
                  <CategoryTile category={item} />
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
              {viewAll.text || 'View all'}
            </LocalizedClientLink>
          </Button>
        )}
      </Box>
    </Container>
  )
}
