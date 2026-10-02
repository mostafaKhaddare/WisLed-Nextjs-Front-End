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

/**
 * `sizes` drives which optimized variant the browser downloads, so it has to
 * mirror the real slot width. Getting this wrong is the usual reason a product
 * grid ships 2x the bytes it needs.
 */
const TILE_SIZES: Record<'list' | 'carousel', string> = {
  // Grid: 2-up until `large` (1024px), 4-up above it.
  list: '(max-width: 1023px) 50vw, 25vw',
  // Carousel slides: 73% / 63% / 43% / 33% / 30% of the container.
  carousel:
    '(max-width: 639px) 73vw, (max-width: 767px) 63vw, (max-width: 1023px) 43vw, (max-width: 1279px) 34vw, 31vw',
}

function hasKelvin(value: string, kelvin: string) {
  return new RegExp(`(^|[^0-9])${kelvin}([^0-9]|$)`).test(value)
}

function getVariantStyle(value: string) {
  const v = value.trim().toLowerCase()

  // Special Variants
  if (v.includes('rgb') || v.includes('couleur'))
    return { background: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', color: '#fff' }
  if (v.includes('cct'))
    return { background: 'linear-gradient(90deg, #ffcc80, #f5f5f5, #bbdefb)', color: '#000' }

  // Color Temperatures. The Kelvin test is digit-bounded on purpose: a plain
  // `includes('5000')` also matched "6500K" and painted cool white as pure
  // white.
  if (hasKelvin(v, '2700') || v.includes('warm') || v.includes('chaud'))
    return { background: '#ffcc80', color: '#000' } // Warm White
  if (hasKelvin(v, '3000')) return { background: '#ffe0b2', color: '#000' }
  if (hasKelvin(v, '4000') || v.includes('naturel') || v.includes('neutral'))
    return { background: '#f5f5f5', color: '#000' } // Neutral White
  if (hasKelvin(v, '5000')) return { background: '#e3f2fd', color: '#000' } // Pure White
  if (hasKelvin(v, '6000') || hasKelvin(v, '6500') || v.includes('cool') || v.includes('froid'))
    return { background: '#bbdefb', color: '#000' } // Cool White (Blue tint)

  // Standard Colors. Matched exactly — the previous `includes('or')` gold rule
  // fired on any value merely containing those two letters.
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

/**
 * Warming the origin on swatch hover removes the TCP/TLS round trip from the
 * click that actually swaps the image. Only fires on deliberate interaction,
 * and only once per URL, so it never costs a whole grid of extra downloads.
 */
const warmedImages = new Set<string>()

function warmImage(src: string | null | undefined) {
  if (!src || warmedImages.has(src) || typeof window === 'undefined') return

  warmedImages.add(src)
  const img = new window.Image()
  img.decoding = 'async'
  img.src = src
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
  }
  regionId: string
  layout?: 'list' | 'carousel'
  /**
   * Load eagerly with a high fetch priority. Set this on the tiles that sit
   * above the fold — they are the LCP element on every listing page.
   */
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

  // Leaving the card restores the product's own thumbnail. Without this the
  // swapped image followed the user around the whole page.
  const handleMouseLeave = useCallback(() => {
    setDisplayedImage(product.thumbnail)
    setSelected(null)
  }, [product.thumbnail])

  // A new `product` (pagination, filters, router refresh) must not leave the
  // tile showing the previous product's variant.
  useEffect(() => {
    setDisplayedImage(product.thumbnail)
    setSelected(null)
  }, [product.thumbnail])

  const imageHeightClass = layout === 'carousel' ? 'h-[285px]' : 'h-[180px]'

  return (
    <Box
      className="group flex h-full flex-col overflow-hidden rounded-none border border-basic-primary/[0.12] shadow-lg bg-primary transition-all duration-300 hover:border-basic-primary/[0.12] hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:shadow-xl dark:hover:shadow-black/20"
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
      onMouseLeave={handleMouseLeave}
    >
      <Box className={`relative ${imageHeightClass} small:h-[366px] bg-secondary/10`}>
        {isNew && (
          <Box className="absolute left-2 top-2 z-10 pointer-events-none small:left-3 small:top-3">
            <Badge label="Nouveau" variant="brand" className="shadow-sm" />
          </Box>
        )}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block h-full w-full">
          {displayedImage ? (
            <LoadingImage
              src={displayedImage}
              alt={product.title}
              loading="lazy"
              priority={priority}
              sizes={TILE_SIZES[layout]}
              fallbackSrc={product.thumbnail || undefined}
              fallback={<BagIcon className="h-16 w-16 text-secondary/50" />}
              className="h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BagIcon className="h-16 w-16 text-secondary/50" />
            </div>
          )}
        </LocalizedClientLink>
        <ProductActions
          productHandle={product.handle}
          regionId={regionId}
          thumbnail={product.thumbnail || undefined}
          title={product.title}
          productId={product.id}
        />
      </Box>
      <ProductInfo
        product={product}
        optionsToRender={optionsToRender}
        selected={selected}
        onOptionSelect={handleOptionSelect}
        onOptionHover={findVariantImage}
      />
    </Box>
  )
})

function ProductInfo({
  product,
  optionsToRender,
  selected,
  onOptionSelect,
  onOptionHover,
}: {
  product: any
  optionsToRender: any[]
  selected: { optionId: string; value: string } | null
  onOptionSelect: (optionId: string, value: string) => void
  onOptionHover: (optionId: string, value: string) => string | null
}) {
  return (
    <Box className="flex flex-col gap-1 p-2 small:gap-2 small:p-3">
      <div className="flex flex-1 flex-col justify-between gap-2">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <Text
            title={product.title}
            as="span"
            className="line-clamp-2 text-left text-sm font-bold text-basic-primary transition-colors group-hover:text-action-primary dark:text-white/90 dark:group-hover:text-brand-400 small:text-base"
          >
            {product.title}
          </Text>
        </LocalizedClientLink>

        {/* Variant Selectors (e.g. 3000K, 4000K) */}
        {optionsToRender.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {optionsToRender.map((opt: any) => {
              const visible = opt.values.slice(0, MAX_SWATCHES_PER_OPTION)
              const overflow = opt.values.length - visible.length

              return (
                <div key={opt.id} className="flex flex-wrap items-center gap-2">
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
                          'flex h-6 min-w-[24px] items-center justify-center rounded-full border px-2 text-[10px] font-bold shadow-sm transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 focus-visible:ring-offset-primary',
                          isActive
                            ? 'scale-105 ring-2 ring-action-primary ring-offset-1 ring-offset-primary'
                            : 'hover:scale-110',
                          style.background
                            ? undefined
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
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

                  {/* Swatches were silently truncated before, so a product with
                      six temperatures looked like it only had four. */}
                  {overflow > 0 && (
                    <span
                      className="text-[10px] font-bold text-basic-primary/50 dark:text-white/50"
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

        <ProductPrice
          calculatedPrice={product.calculatedPrice}
          salePrice={product.salePrice}
        />
      </div>
    </Box>
  )
}
