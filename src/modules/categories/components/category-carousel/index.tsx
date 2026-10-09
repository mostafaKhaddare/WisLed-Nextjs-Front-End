'use client'

import { useState } from 'react'
import { StoreProductCategory } from '@medusajs/types'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Button } from '@modules/common/components/button'
import { SectionHeading } from '@modules/common/components/heading'
import { CategoryTile } from '../category-tile'

interface ViewAllProps {
  link: string
  text?: string
}

interface CategoryCarouselProps {
  categories: StoreProductCategory[]
  title: string
  viewAll?: ViewAllProps
  testId?: string
  initialLimit?: number
  headingDescription?: React.ReactNode
}

const DEFAULT_LIMIT = 20

export function CategoryCarousel({
  categories,
  title,
  viewAll,
  testId,
  initialLimit = DEFAULT_LIMIT,
  headingDescription,
}: CategoryCarouselProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const hasMore = displayCategories.length > initialLimit
  const visibleCategories = isExpanded ? displayCategories : displayCategories.slice(0, initialLimit)

  return (
    <Container className="flex flex-col gap-8 small:gap-12" data-testid={testId}>
      <div>
        <SectionHeading as="h2" accent>
          {title}
        </SectionHeading>
        {headingDescription && (
          <div className="mt-2 text-secondary text-sm">
            {headingDescription}
          </div>
        )}
      </div>

      {/* Category Grid */}
      <ul
        className="grid w-full grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 small:gap-x-6 small:gap-y-10 large:grid-cols-4"
        role="list"
        aria-label={title}
      >
        {visibleCategories.map((item) => {
          return (
            <li key={item.id} className="min-w-0">
              <CategoryTile category={item} />
            </li>
          )
        })}
      </ul>

      {/* Expand/Collapse Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="tonal"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-auto min-w-[160px] transition-all duration-300"
            aria-expanded={isExpanded}
            aria-controls={`${testId}-category-list`}
          >
            {isExpanded ? 'Afficher moins' : 'Afficher tout'}
            <svg
              className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </Button>
        </div>
      )}

      {/* Original ViewAll link (navigates to full category page) */}
      {viewAll && !hasMore && (
        <div className="flex justify-center pt-4">
          <Button asChild>
            <LocalizedClientLink
              href={viewAll.link}
              className="mx-auto w-max !px-5 !py-3"
            >
              {viewAll.text || 'Voir tout'}
            </LocalizedClientLink>
          </Button>
        </div>
      )}
    </Container>
  )
}