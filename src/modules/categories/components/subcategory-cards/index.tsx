'use client'

import Image from 'next/image'

import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Box } from '@modules/common/components/box'
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
}

/** Tints cycling per position, so consecutive tiles never look identical. */
const TILE_GRADIENTS = [
  'linear-gradient(135deg, #FFF3DC 0%, #FFE2A8 100%)',
  'linear-gradient(135deg, #E9E2FF 0%, #C9B8FF 100%)',
  'linear-gradient(135deg, #D8F5FF 0%, #9FE3FA 100%)',
]

/** LED-strip bar drawn on the placeholder tile when a category has no image. */
const TILE_BARS = [
  { fill: '#FFC15A', glow: 'rgba(255,170,40,0.7)' },
  { fill: '#B79CFF', glow: 'rgba(130,90,255,0.65)' },
  { fill: '#3CC8F0', glow: 'rgba(30,170,229,0.65)' },
]

/**
 * Horizontal strip of square subcategory tiles.
 *
 * A 112x112 rounded tile (24px radius) holding the category's own photo when one
 * exists, or a tinted placeholder with an LED-strip bar; the name sits beneath.
 */
export function SubcategoryCards({ subcategories }: SubcategoryCardsProps) {
  if (!subcategories?.length) return null

  return (
    <Box className="w-full px-2" aria-label="Sous-catégories">
      <Box className="scrollbar-hide -mx-2 overflow-x-auto px-2 pb-2">
        <Box className="flex flex-row items-end gap-3" role="list">
          {subcategories.map((subcat, index) => {
            const gradient = TILE_GRADIENTS[index % TILE_GRADIENTS.length]
            const bar = TILE_BARS[index % TILE_BARS.length]

            return (
              <LocalizedClientLink
                key={subcat.id}
                href={`/categories/${subcat.handle}`}
                className="group/card flex w-[112px] shrink-0 flex-col"
                role="listitem"
                data-testid={formatNameForTestId(`${subcat.name}-subcategory-card`)}
              >
                {/* Tile */}
                <span
                  className="relative block h-[112px] w-[112px] shrink-0 overflow-hidden rounded-3xl transition-transform duration-300 group-hover/card:-translate-y-0.5"
                  style={subcat.image ? undefined : { background: gradient }}
                >
                  {subcat.image ? (
                    <Image
                      src={subcat.image.url}
                      alt={subcat.image.alt || subcat.name}
                      fill
                      sizes="112px"
                      loading="lazy"
                      className="object-cover object-center"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 h-2.5 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[5px]"
                      style={{
                        background: bar.fill,
                        boxShadow: `0 0 22px 5px ${bar.glow}`,
                      }}
                    />
                  )}
                </span>

                <span className="mt-2.5 line-clamp-2 font-jakarta text-[13px] font-semibold leading-snug text-[#0F1B33] dark:text-white">
                  {subcat.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
