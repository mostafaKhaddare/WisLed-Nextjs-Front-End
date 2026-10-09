'use client'

import Image from 'next/image'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'

interface CategoryImage {
  url: string
  alt?: string
}

interface SubcategoryItem {
  id: string
  name: string
  handle: string
  image?: CategoryImage | null
}

interface SubcategoryCardsProps {
  subcategories: SubcategoryItem[]
  countryCode: string
}

export function SubcategoryCards({ subcategories, countryCode }: SubcategoryCardsProps) {
  if (!subcategories?.length) return null

  return (
    <Box className="w-full py-4" aria-label="Sous-catégories">
      <Box className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <Box className="flex flex-row items-start gap-3 min-w-max" role="list">
          {subcategories.map((subcat) => (
            <LocalizedClientLink
              key={subcat.id}
              href={`/categories/${subcat.handle}`}
              className="group/card relative flex flex-col items-center gap-2 shrink-0 w-[160px] sm:w-[180px] rounded-xl overflow-hidden bg-primary border border-border-basic-primary/50 dark:border-white/[0.06] dark:bg-white/[0.02] transition-all duration-300 hover:shadow-lg hover:border-wisled-200/50 dark:hover:border-wisled-800/30 hover:-translate-y-0.5"
              data-testid={formatNameForTestId(`${subcat.name}-subcategory-card`)}
            >
              {/* Image container with light neutral background */}
              <Box className="relative aspect-square w-full overflow-hidden bg-wisled-50/80 dark:bg-wisled-950/50">
                {subcat.image ? (
                  <Image
                    src={subcat.image.url}
                    alt={subcat.image.alt || subcat.name}
                    fill
                    sizes="160px"
                    loading="lazy"
                    className="object-contain p-3 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover/card:scale-[1.03]"
                  />
                ) : (
                  <Box className="flex h-full w-full items-center justify-center bg-wisled-100/50 dark:bg-wisled-900/30">
                    <svg
                      className="h-10 w-10 text-wisled-300 dark:text-wisled-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
                      />
                    </svg>
                  </Box>
                )}
              </Box>

              {/* Subcategory name */}
              <Box className="px-3 pb-3 w-full text-center">
                <Text
                  title={subcat.name}
                  as="span"
                  className="text-sm font-medium text-basic-primary leading-snug transition-colors group-hover/card:text-wisled-600 dark:text-white/90 dark:group-hover/card:text-wisled-400 line-clamp-2 min-h-[2.5rem]"
                >
                  {subcat.name}
                </Text>
              </Box>
            </LocalizedClientLink>
          ))}
        </Box>
      </Box>

      {/* Scroll indicator */}
      {subcategories.length > 5 && (
        <Box className="absolute bottom-0 right-0 left-0 h-16 bg-gradient-to-t from-primary to-transparent pointer-events-none dark:from-white/[0.02]" aria-hidden="true" />
      )}
    </Box>
  )
}