interface ViewAllProps {
  link: string
  text?: string
}
import { StoreProductCategory } from '@medusajs/types'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { CategoryTile } from '../category-tile'

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
    <Container className="flex flex-col gap-8 small:gap-12" data-testid={testId}>
      <div>
        <Heading
          as="h2"
          className="text-2xl font-bold text-basic-primary small:text-3xl large:text-4xl"
        >
          {title}
        </Heading>

        {/* Angled accent bar — drawn with CSS, no image asset. */}
        <div
          aria-hidden="true"
          className="relative mt-5 h-1.5 w-24 overflow-hidden rounded-full bg-fg-secondary"
        >
          <span className="absolute inset-y-0 left-0 w-2/3 origin-left rounded-full bg-gradient-to-r from-wisled-500 to-wisled-400 [transform:skewX(-20deg)]" />
        </div>
      </div>

      {/* Always a grid, never a carousel: 2 columns on mobile (360px / 390px),
          3 on tablet, 4 from large screens up. minmax(0, 1fr) keeps the tracks
          from being widened by long words in a category name. */}
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 small:gap-x-6 small:gap-y-10 large:grid-cols-4">
        {displayCategories.map((item) => {
          return (
            <li key={item.id} className="min-w-0">
              <CategoryTile category={item} />
            </li>
          )
        })}
      </ul>

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
    </Container>
  )
}