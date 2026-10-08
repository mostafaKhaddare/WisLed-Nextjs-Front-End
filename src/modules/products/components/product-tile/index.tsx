'use client'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BagIcon } from '@modules/common/icons'

import { ProductActions } from './action'
import { LoadingImage } from './loading-image'
import ProductPrice from './price'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

const MAX_SWATCHES_PER_OPTION = 4

const TILE_SIZES: Record<'list' | 'carousel', string> = {
  list: '(max-width: 1023px) 50vw, 25vw',
  carousel:
    '(max-width: 639px) 73vw, (max-width: 767px) 63vw, (max-width: 1023px) 43vw, (max-width: 1279px) 34vw, 31vw',
}

function hasKelvin(value: string, kelvin: string) {
  return new RegExp(`(^|[^0-9])${kelvin}([^0-9]|$)`).test(value)
}

function getVariantStyle(value: string) {
  const v = value.trim().toLowerCase()

  if (v.includes('rgb') || v.includes('couleur'))
    return { background: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', color: '#fff' }
  if (v.includes('cct'))
    return { background: 'linear-gradient(90deg, #ffcc80, #f5f5f5, #bbdefb)', color: '#000' }

  if (hasKelvin(v, '2700') || v.includes('warm') || v.includes('chaud'))
    return { background: '#ffcc80', color: '#000' }
  if (hasKelvin(v, '3000')) return { background: '#ffe0b2', color: '#000' }
  if (hasKelvin(v, '4000') || v.includes('naturel') || v.includes('neutral'))
    return { background: '#f5f5f5', color: '#000' }
  if (hasKelvin(v, '5000')) return { background: '#e3f2fd', color: '#000' }
  if (hasKelvin(v, '6000') || hasKelvin(v, '6500') || v.includes('cool') || v.includes('froid'))
    return { background: '#bbdefb', color: '#000' }

  if (v === 'black' || v === 'noir') return { background: '#111', color: '#fff' }
  if (v === 'white' || v === 'blanc') return { background: '#fff', color: '#111' }
  if (v === 'red' || v === 'rouge') return { background: '#ef4444', color: '#fff' }
  if (v === 'green' || v.includes('vert')) return { background: '#22c55e', color: '#fff' }
  if (v === 'blue' || v === 'bleu') return { background: '#3b82f6', color: '#fff' }
  if (v === 'gold' || v === 'or' || v.includes('doré') || v.includes('dore'))
    return { background: '#FFD700', color: '#000' }
  if (v.includes('silver') || v.includes('argent')) return { background: '#C0C0C0', color: '#000' }
  if (v === 'gray' || v === 'grey' || v === 'gris') return { background: '#9CA3AF', color: '#fff' }
  if (v.includes('transparent'))
    return { background: 'linear-gradient(135deg, #e5e7eb, #f9fafb)', color: '#111' }

  return { background: '', color: '' }
}

const warmedImages = new Set<string>()

function warmImage(src: string | null | undefined) {
  if (!src || warmedImages.has(src) || typeof window === 'undefined') return

  warmedImages.add(src)
  const img = new window.Image()
  img.decoding = 'async'
  img.src = src
}

function hasSalePrice(product: { calculatedPrice: string; salePrice?: string }) {
  return Boolean(product.salePrice && product.salePrice !== product.calculatedPrice)
}

function getDiscountPercentage(product: { calculatedPrice: string; salePrice?: string }) {
  if (!hasSalePrice(product)) return 0
  const current = parseFloat(product.calculatedPrice.replace(/[^\d.,]/g, '').replace(',', '.'))
  const original = parseFloat(product.salePrice.replace(/[^\d.,]/g, '').replace(',', '.'))
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
  const [selected, setSelected] = useState<{ optionId: string; value: string } | null>(null)

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

  const findVariantImage = useCallback(
    (optionId: string, value: string) =>
      product.variants?.find((v: any) =>
        v.options?.some((o: any) => o.option_id === optionId && o.value === value)
      )?.thumbnail ?? null,
    [product.variants]
  )

  const handleOptionSelect = useCallback(
    (optionId: string, value: string) => {
      const variantThumbnail = findVariantImage(optionId, value)

      if (variantThumbnail) {
        setDisplayedImage(variantThumbnail)
        setSelected({ optionId, value })
      }
    },
    [findVariantImage]
  )

  const handleMouseLeave = useCallback(() => {
    setDisplayedImage(product.thumbnail)
    setSelected(null)
  }, [product.thumbnail])

  useEffect(() => {
    setDisplayedImage(product.thumbnail)
    setSelected(null)
  }, [product.thumbnail])

  const imageHeightClass = layout === 'carousel' ? 'h-[280px]' : 'h-[180px]'

  return (
    <Box
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl',
        'bg-primary border border-border-basic-primary dark:border-white/[0.06] dark:bg-white/[0.02]',
        'shadow-card-subtle transition-all duration-300',
        'hover:shadow-card-hover hover:border-wisled-200/50 dark:hover:border-wisled-800/30',
        layout === 'carousel' && 'min-h-0'
      )}
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
      onMouseLeave={handleMouseLeave}
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

        {/* Quick Actions Overlay - Top Right & Bottom Right */}
        <ProductActions
          productHandle={product.handle}
          regionId={regionId}
          thumbnail={product.thumbnail || undefined}
          title={product.title}
          productId={product.id}
        />
      </Box>

      {/* Product Info */}
      <Box className="flex flex-1 flex-col gap-2 p-3 small:p-4 min-h-[120px]">
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

          {/* Variant Selectors */}
          {optionsToRender.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5" role="group" aria-label="Options de produit">
              {optionsToRender.map((opt: any) => {
                const visible = opt.values.slice(0, MAX_SWATCHES_PER_OPTION)
                const overflow = opt.values.length - visible.length

                return (
                  <div key={opt.id} className="flex flex-wrap items-center gap-1.5">
                    {visible.map((val: string) => {
                      const style = getVariantStyle(val)
                      const isActive = selected?.optionId === opt.id && selected.value === val

                      return (
                        <button
                          key={`${opt.id}-${val}`}
                          type="button"
                          aria-pressed={isActive}
                          aria-label={`${opt.title ?? 'Option'} : ${val}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onOptionSelect(opt.id, val)
                          }}
                          onPointerEnter={() => warmImage(onOptionHover(opt.id, val))}
                          onFocus={() => warmImage(onOptionHover(opt.id, val))}
                          title={val}
                          className={cn(
                            'flex h-6 min-w-[24px] items-center justify-center rounded-full border px-2 text-[10px] font-medium shadow-sm transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wisled-500 focus-visible:ring-offset-1 focus-visible:ring-offset-primary',
                            isActive
                              ? 'scale-105 ring-2 ring-wisled-500 ring-offset-1 ring-offset-primary'
                              : 'hover:scale-105',
                            style.background
                              ? undefined
                              : 'border-wisled-200 bg-wisled-50 text-wisled-700 hover:bg-wisled-100 dark:border-wisled-800 dark:bg-wisled-900/40 dark:text-wisled-200 dark:hover:bg-wisled-800/60'
                          )}
                          style={
                            style.background
                              ? { background: style.background, color: style.color, borderColor: 'rgba(0,0,0,0.1)' }
                              : undefined
                          }
                        >
                          {val}
                        </button>
                      )
                    })}

                    {overflow > 0 && (
                      <span
                        className="text-[10px] font-medium text-basic-primary/50 dark:text-white/50"
                        title={opt.values.slice(MAX_SWATCHES_PER_OPTION).join(', ')}
                      >
                        +{overflow}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Price */}
          <ProductPrice
            calculatedPrice={product.calculatedPrice}
            salePrice={product.salePrice}
          />
        </div>
      </Box>
    </Box>
  )
})

ProductTile.displayName = 'ProductTile'