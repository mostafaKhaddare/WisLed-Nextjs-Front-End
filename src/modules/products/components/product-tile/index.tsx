'use client'

import { memo, useMemo, useState } from 'react'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { BagIcon } from '@modules/common/icons'

import { AddToCartButton, WishlistButton } from './action'
import {
  CHIP_BG,
  CHIP_TEXT,
  NAVY,
  PHOTO_GRADIENT,
  getVariantDotColor,
} from './design-tokens'
import { LoadingImage } from './loading-image'

const MAX_VARIANT_CHIPS = 3
const MAX_SPEC_ITEMS = 4

const TILE_SIZES: Record<'list' | 'carousel', string> = {
  list: '(max-width: 1023px) 50vw, 25vw',
  carousel:
    '(max-width: 639px) 62vw, (max-width: 767px) 42vw, (max-width: 1023px) 32vw, (max-width: 1279px) 26vw, 24vw',
}

/** Options whose values are best read as colour / temperature swatches. */
const COLOR_OPTION_RE =
  /temp|couleur|color|kelvin|blanc|white|rgb|cct|teinte|ambiance|lumiere|lumière/i

function isColorOption(title: string): boolean {
  return COLOR_OPTION_RE.test(title ?? '')
}

/** Rough weight so measurable options read before free-form ones. */
function getOptionPriority(optionTitle: string): number {
  const title = optionTitle.toLowerCase()
  if (
    title.includes('longueur') ||
    title.includes('length') ||
    title.includes('taille') ||
    title.includes('meter') ||
    title.includes('mètre') ||
    title.includes('ip') ||
    title.includes('étanchéité') ||
    title.includes('etancheite')
  ) {
    return 1
  }
  if (
    title.includes('tension') ||
    title.includes('voltage') ||
    title.includes('volt')
  ) {
    return 2
  }
  if (isColorOption(title)) return 3
  return 4
}

function hasSalePrice(product: {
  calculatedPrice: string
  salePrice?: string
}) {
  return Boolean(
    product.salePrice && product.salePrice !== product.calculatedPrice
  )
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0
  return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'))
}

function getDiscountPercentage(product: {
  calculatedPrice: string
  salePrice?: string
}) {
  if (!hasSalePrice(product)) return 0
  const current = parsePrice(product.calculatedPrice)
  const original = parsePrice(product.salePrice)
  if (!current || !original || original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

/**
 * Splits a localised currency string such as `MAD 100.00` (or `100.00 MAD`)
 * into its number and its currency code so the two can be styled separately —
 * the mock types the amount large and the currency as a small muted tail.
 */
function splitPrice(price?: string): { amount: string; currency: string } {
  const trimmed = (price ?? '').trim()
  if (!trimmed) return { amount: '', currency: '' }

  const prefixed = /^(?<cur>[A-Za-z]{3})\s*(?<amt>[\d\s.,]+)$/.exec(trimmed)
  if (prefixed?.groups) {
    return {
      amount: prefixed.groups.amt.trim(),
      currency: prefixed.groups.cur.toUpperCase(),
    }
  }

  const suffixed = /^(?<amt>[\d\s.,]+)\s*(?<cur>[A-Za-z]{3})$/.exec(trimmed)
  if (suffixed?.groups) {
    return {
      amount: suffixed.groups.amt.trim(),
      currency: suffixed.groups.cur.toUpperCase(),
    }
  }

  return { amount: trimmed, currency: '' }
}

/** Light swatches would vanish into the chip fill, so they get a hairline. */
function needsSwatchRing(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return false
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  // Relative luminance, quick approximation.
  return (r * 299 + g * 587 + b * 114) / 1000 > 205
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
  const [displayedImage, setDisplayedImage] = useState<string | null>(
    product.thumbnail
  )

  // Hoisted to primitives so the memoisers below can depend on values instead
  // of the object literal the parent builds inline each render.
  const createdAt = product.created_at
  const metadata = product.metadata
  const calculatedPrice = product.calculatedPrice
  const salePrice = product.salePrice

  const isNew = useMemo(() => {
    const createdDate = new Date(createdAt)
    const currentDate = new Date()
    const differenceInDays =
      (currentDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)

    return differenceInDays <= 7
  }, [createdAt])

  const isBestSeller = useMemo(() => {
    return metadata?.is_bestseller === true
  }, [metadata])

  const onSale = useMemo(
    () => hasSalePrice({ calculatedPrice, salePrice }),
    [calculatedPrice, salePrice]
  )
  const discountPct = useMemo(
    () => getDiscountPercentage({ calculatedPrice, salePrice }),
    [calculatedPrice, salePrice]
  )

  const optionsToRender = useMemo(() => {
    if (!product.options || !product.variants) return []

    return product.options
      .map((opt: any) => {
        const values = Array.from(
          new Set(
            product.variants!.map((v: any) => {
              const val = v.options.find((o: any) => o.option_id === opt.id)
                ?.value
              return val
            })
          )
        ).filter(Boolean) as string[]

        return { ...opt, values }
      })
      .filter((o: any) => o.values.length > 0)
      .sort(
        (a: any, b: any) =>
          getOptionPriority(a.title) - getOptionPriority(b.title)
      )
  }, [product])

  const colorOption = useMemo(
    () =>
      optionsToRender.find((o: any) => isColorOption(o.title)) ??
      optionsToRender[0],
    [optionsToRender]
  )

  /**
   * Colour / temperature values become the labelled chips; everything else is
   * folded into the one-line spec strip under the title, which is where the
   * mock shows "480 LED/m · 5 m · 24V · IP20".
   */
  const chips = useMemo(
    () => (colorOption ? colorOption.values.slice(0, MAX_VARIANT_CHIPS) : []),
    [colorOption]
  )

  const specLine = useMemo(() => {
    const others = optionsToRender.filter((o: any) => o !== colorOption)
    const values = Array.from(
      new Set(others.flatMap((o: any) => o.values as string[]))
    ).slice(0, MAX_SPEC_ITEMS)

    return values.join(' · ')
  }, [optionsToRender, colorOption])

  const { amount, currency } = useMemo(
    () => splitPrice(product.calculatedPrice),
    [product.calculatedPrice]
  )

  const handleOptionClick = (
    e: React.MouseEvent,
    optionId: string,
    value: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const variant = product.variants?.find((v: any) =>
      v.options.some((o: any) => o.option_id === optionId && o.value === value)
    )

    if (variant?.thumbnail) {
      setDisplayedImage(variant.thumbnail)
    }
  }

  const isCarousel = layout === 'carousel'

  return (
    <article
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden bg-white',
        'rounded-[20px] small:rounded-3xl',
        'shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-8px_rgba(20,20,59,0.14)]',
        'transition-shadow duration-300',
        'hover:shadow-[0_2px_4px_rgba(20,20,59,0.06),0_16px_32px_-12px_rgba(20,20,59,0.2)]',
        'dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]',
        isCarousel ? 'max-w-[220px] small:max-w-[360px]' : 'max-w-none'
      )}
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
    >
      {/* ── Photo ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden',
          isCarousel ? 'h-[120px]' : 'h-[150px]',
          'small:h-[240px] large:h-[210px]'
        )}
        style={{ background: PHOTO_GRADIENT }}
      >
        {/* Badges */}
        {(onSale || isNew || isBestSeller) && (
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5 small:left-3.5 small:top-3.5">
            {onSale && discountPct > 0 && (
              <span className="inline-flex h-[21.6px] items-center rounded-[10px] bg-[#E5484D] px-2 font-jakarta text-[11px] font-bold leading-none text-white small:h-[25.2px] small:rounded-xl small:text-xs">
                -{discountPct}%
              </span>
            )}
            {isNew && (
              <span
                className="inline-flex h-[21.6px] items-center rounded-[10px] px-2 font-jakarta text-[11px] font-bold leading-none text-white small:h-[25.2px] small:rounded-xl small:text-xs"
                style={{ backgroundColor: NAVY }}
              >
                Nouveau
              </span>
            )}
            {isBestSeller && (
              <span className="inline-flex h-[21.6px] items-center rounded-[10px] bg-[#0F7B3D] px-2 font-jakarta text-[11px] font-bold leading-none text-white small:h-[25.2px] small:rounded-xl small:text-xs">
                Best Seller
              </span>
            )}
          </div>
        )}

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block h-full w-full"
          aria-label={product.title}
        >
          {displayedImage ? (
            <LoadingImage
              src={displayedImage}
              alt={product.title}
              loading="lazy"
              priority={priority}
              sizes={TILE_SIZES[layout]}
              fallbackSrc={product.thumbnail || undefined}
              fallback={<BagIcon className="h-10 w-10 text-[#5B6577]/40" />}
              className="h-full w-full object-fill transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BagIcon className="h-10 w-10 text-[#5B6577]/40" />
            </div>
          )}
        </LocalizedClientLink>

        <WishlistButton
          productHandle={product.handle}
          regionId={regionId}
          thumbnail={product.thumbnail || undefined}
          title={product.title}
          productId={product.id}
        />
      </div>

      {/* ── Copy ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3 small:p-4">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block"
        >
          <h3 className="line-clamp-2 font-jakarta text-sm font-semibold leading-snug text-[#0F1B33] small:text-base small:leading-[1.4] dark:text-white">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {specLine && (
          <p className="mt-1 line-clamp-2 font-jakarta text-xs leading-snug text-[#5B6577] small:mt-1.5 small:text-[13px] dark:text-gray-400">
            {specLine}
          </p>
        )}

        {/* Variant chips */}
        {chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 small:mt-3 small:gap-2">
            {chips.map((val: string) => {
              const dot = getVariantDotColor(val)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={(e) =>
                    colorOption && handleOptionClick(e, colorOption.id, val)
                  }
                  title={val}
                  aria-label={`Voir la variante ${val}`}
                  className={cn(
                    'inline-flex h-[21.6px] shrink-0 items-center gap-1.5 rounded-[10px] px-2',
                    'font-jakarta text-[11px] font-semibold leading-none transition-[filter]',
                    'hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]',
                    'small:h-[23.2px] small:px-2.5 small:text-xs'
                  )}
                  style={{ backgroundColor: CHIP_BG, color: CHIP_TEXT }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      needsSwatchRing(dot) && 'ring-1 ring-[#5B6577]/25'
                    )}
                    style={{ backgroundColor: dot }}
                  />
                  {val}
                </button>
              )
            })}
          </div>
        )}

        {/* Price + add to cart */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3 small:pt-4">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            {onSale && (
              <span className="font-jakarta text-xs font-medium text-[#5B6577] line-through small:text-[13px]">
                {splitPrice(product.salePrice).amount}
              </span>
            )}
            <span className="font-sora text-[15px] font-bold leading-none text-[#0F1B33] small:text-xl dark:text-white">
              {amount}
            </span>
            <span className="font-jakarta text-[11px] font-semibold leading-none text-[#5B6577] small:text-xs">
              {currency || 'MAD'}
            </span>
          </div>

          <AddToCartButton
            productHandle={product.handle}
            regionId={regionId}
          />
        </div>
      </div>
    </article>
  )
})

ProductTile.displayName = 'ProductTile'
