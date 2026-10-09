'use client'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BagIcon } from '@modules/common/icons'

import { AddToCartButton, WishlistButton } from './action'
import { LoadingImage } from './loading-image'
import ProductPrice from './price'
import { memo, useMemo, useState } from 'react'

const MAX_VARIANT_BADGES = 3

const TILE_SIZES: Record<'list' | 'carousel', string> = {
  list: '(max-width: 1023px) 50vw, 25vw',
  carousel:
    '(max-width: 639px) 73vw, (max-width: 767px) 63vw, (max-width: 1023px) 43vw, (max-width: 1279px) 34vw, 31vw',
}

function getOptionPriority(optionTitle: string): number {
  const title = optionTitle.toLowerCase()
  if (title.includes('longueur') || title.includes('length') || title.includes('size') || title.includes('taille') || title.includes('meter') || title.includes('mètre') || title.includes('cm') || title.includes('mm') || title.includes('5m') || title.includes('10m')) return 1
  if (title.includes('tension') || title.includes('voltage') || title.includes('volt') || title.includes('12v') || title.includes('24v')) return 2
  if (title.includes('température') || title.includes('temperature') || title.includes('couleur') || title.includes('color') || title.includes('kelvin') || title.includes('blanc') || title.includes('white') || title.includes('rgb') || title.includes('cct')) return 3
  return 4
}

function getPrioritizedVariantValues(optionsToRender: any[]): string[] {
  const allValues: { value: string; priority: number }[] = []

  for (const opt of optionsToRender) {
    const priority = getOptionPriority(opt.title)
    for (const val of opt.values) {
      allValues.push({ value: val, priority })
    }
  }

  allValues.sort((a, b) => a.priority - b.priority)

  const uniqueValues = Array.from(new Set(allValues.map(v => v.value)))
  return uniqueValues.slice(0, MAX_VARIANT_BADGES)
}

function hasSalePrice(product: { calculatedPrice: string; salePrice?: string }) {
  return Boolean(product.salePrice && product.salePrice !== product.calculatedPrice)
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0
  return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'))
}

function getDiscountPercentage(product: { calculatedPrice: string; salePrice?: string }) {
  if (!hasSalePrice(product)) return 0
  const current = parsePrice(product.calculatedPrice)
  const original = parsePrice(product.salePrice)
  if (!current || !original || original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

export const ProductTile = memo(function ProductTile({
  product,
  regionId,
  layout = 'list',
  priority = false,
}: {
  product: {
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string | null
    calculatedPrice: string
    salePrice?: string
    variants?: any[]
    options?: any[]
    metadata?: Record<string, unknown>
  }
  regionId: string
  layout?: 'list' | 'carousel'
  priority?: boolean
}) {
  const [displayedImage, setDisplayedImage] = useState<string | null>(product.thumbnail)

  const isNew = useMemo(() => {
    const createdAt = new Date(product.created_at)
    const currentDate = new Date()
    const differenceInDays =
      (currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

    return differenceInDays <= 7
  }, [product.created_at])

  const isBestSeller = useMemo(() => {
    return product.metadata?.is_bestseller === true ||
      product.metadata?.isBestSeller === true ||
      product.metadata?.best_seller === true
  }, [product.metadata])

  const onSale = useMemo(() => hasSalePrice(product), [product.calculatedPrice, product.salePrice])
  const discountPct = useMemo(() => getDiscountPercentage(product), [product.calculatedPrice, product.salePrice])

  const optionsToRender = useMemo(() => {
    if (!product.options || !product.variants) return []

    return product.options
      .map((opt: any) => {
        const values = Array.from(
          new Set(
            product.variants!.map((v: any) => {
              const val = v.options.find((o: any) => o.option_id === opt.id)?.value
              return val
            })
          )
        ).filter(Boolean)

        return { ...opt, values }
      })
      .filter((o: any) => o.values.length > 0)
  }, [product])

  const variantBadges = useMemo(() => {
    if (optionsToRender.length === 0) return { values: [], hasMore: false }
    const prioritized = getPrioritizedVariantValues(optionsToRender)
    const totalUniqueValues = Array.from(new Set(optionsToRender.flatMap((o: any) => o.values))).length
    return {
      values: prioritized,
      hasMore: totalUniqueValues > prioritized.length
    }
  }, [optionsToRender])

  const imageHeightClass = layout === 'carousel' ? 'h-[280px]' : 'h-[180px]'

  return (
    <Box
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl',
        'w-full max-w-[220px] small:max-w-[260px] large:max-w-[240px]',
        'bg-card border border-border-primary dark:border-white/[0.06] dark:bg-white/[0.02]',
        'shadow-card-subtle transition-all duration-300',
        'hover:shadow-card-hover hover:border-wisled-200/50 dark:hover:border-wisled-800/30',
        layout === 'carousel' && 'min-h-0'
      )}
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
    >
      <Box className={cn('relative overflow-hidden rounded-t-xl', imageHeightClass, 'bg-wisled-50/50 dark:bg-wisled-950/30')}>
        {/* Badges - Top Left */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 small:left-3 small:top-3" aria-hidden="true">
          {onSale && discountPct > 0 && (
            <Badge label={`-${discountPct}%`} variant="red" className="shadow-sm" />
          )}
          {isNew && (
            <Badge label="Nouveau" variant="brand" className="shadow-sm" />
          )}
          {isBestSeller && (
            <Badge label="Best Seller" variant="green" className="shadow-sm" />
          )}
        </div>

        {/* Product Image */}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block h-full w-full" aria-label={product.title}>
          {displayedImage ? (
            <LoadingImage
              src={displayedImage}
              alt={product.title}
              loading="lazy"
              priority={priority}
              sizes={TILE_SIZES[layout]}
              fallbackSrc={product.thumbnail || undefined}
              fallback={<BagIcon className="h-16 w-16 text-secondary/50" />}
              className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-wisled-50/50 dark:bg-wisled-950/30">
              <BagIcon className="h-16 w-16 text-secondary/50" />
            </div>
          )}
        </LocalizedClientLink>

        {/* Quick Actions Overlay - Top Right */}
        <WishlistButton
          productHandle={product.handle}
          regionId={regionId}
          thumbnail={product.thumbnail || undefined}
          title={product.title}
          productId={product.id}
        />
      </Box>

      {/* Product Info */}
      <Box className="flex flex-1 flex-col gap-2 p-3 small:p-4 small:pb-1 min-h-[120px]">
        <div className="flex flex-1 flex-col justify-between gap-2 min-h-0">
          {/* Title */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="min-h-[40px] small:min-h-[44px]">
            <Text
              title={product.title}
              as="span"
              className="line-clamp-2 text-sm font-medium text-basic-primary leading-snug transition-colors group-hover:text-wisled-600 dark:text-white/90 dark:group-hover:text-wisled-400 small:text-base"
            >
              {product.title}
            </Text>
          </LocalizedClientLink>

          {/* Variant Badges - Non-interactive display of available options */}
          {variantBadges.values.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 overflow-hidden" aria-label="Variantes disponibles">
              {variantBadges.values.map((val: string, idx: number) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex h-5 items-center justify-center rounded-[6px] border px-2 text-[11px] font-medium',
                    'border-wisled-200 bg-wisled-100/80 text-wisled-700',
                    'dark:border-wisled-800 dark:bg-wisled-900/50 dark:text-wisled-200',
                    'whitespace-nowrap flex-shrink-0'
                  )}
                >
                  {val}
                </span>
              ))}
              {variantBadges.hasMore && (
                <span
                  className={cn(
                    'inline-flex h-5 items-center justify-center rounded-[6px] border px-2 text-[11px] font-medium',
                    'border-wisled-200 bg-wisled-100/80 text-wisled-500',
                    'dark:border-wisled-800 dark:bg-wisled-900/50 dark:text-wisled-400',
                    'whitespace-nowrap flex-shrink-0'
                  )}
                >
                  +{Array.from(new Set(optionsToRender.flatMap((o: any) => o.values))).length - variantBadges.values.length}
                </span>
              )}
            </div>
          )}

          {/* Price + Add to Cart - side by side */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <ProductPrice
              calculatedPrice={product.calculatedPrice}
              salePrice={product.salePrice}
            />
            <AddToCartButton
              productHandle={product.handle}
              regionId={regionId}
            />
          </div>
        </div>
      </Box>
    </Box>
  )
})

ProductTile.displayName = 'ProductTile'