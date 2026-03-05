

'use client'

import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BagIcon } from '@modules/common/icons'

import { ProductActions } from './action'
import { LoadingImage } from './loading-image'
import ProductPrice from './price'
import { useState, useMemo, memo } from 'react'

function getVariantStyle(value: string) {
  const v = value.toLowerCase();

  // Color Temperatures
  if (v.includes('2700') || v.includes('warm')) return { background: '#ffcc80', color: '#000' }; // Warm White
  if (v.includes('3000')) return { background: '#ffe0b2', color: '#000' }; // Warm (Less orange)
  if (v.includes('4000') || v.includes('naturel') || v.includes('neutral')) return { background: '#f5f5f5', color: '#000' }; // Neutral White
  if (v.includes('5000')) return { background: '#e3f2fd', color: '#000' }; // Pure White
  if (v.includes('6000') || v.includes('6500') || v.includes('cool')) return { background: '#bbdefb', color: '#000' }; // Cool White (Blue tint)

  // Special Variants
  if (v.includes('rgb')) return { background: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', color: '#fff' };
  if (v.includes('cct')) return { background: 'linear-gradient(90deg, #ffcc80, #f5f5f5, #bbdefb)', color: '#000' };

  // Standard Colors
  if (v === 'black' || v === 'noir') return { background: '#111', color: '#fff' };
  if (v === 'white' || v === 'blanc') return { background: '#fff', color: '#111' };
  if (v === 'red' || v === 'rouge') return { background: '#ef4444', color: '#fff' };
  if (v === 'green' || v === 'vert') return { background: '#22c55e', color: '#fff' };
  if (v === 'blue' || v === 'bleu') return { background: '#3b82f6', color: '#fff' };
  if (v.includes('gold') || v.includes('or')) return { background: '#FFD700', color: '#000' };
  if (v.includes('silver') || v.includes('argent')) return { background: '#C0C0C0', color: '#000' };

  return { background: '', color: '' };
}

export const ProductTile = memo(function ProductTile({
  product,
  regionId,
  layout = 'list',
}: {
  product: {
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string | null
    calculatedPrice: string
    salePrice: string
    variants?: any[]
    options?: any[]
  }
  regionId: string
  layout?: 'list' | 'carousel'
}) {
  const [displayedImage, setDisplayedImage] = useState<string | null>(product.thumbnail)

  const isNew = useMemo(() => {
    const createdAt = new Date(product.created_at)
    const currentDate = new Date()
    const differenceInDays =
      (currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

    return differenceInDays <= 7
  }, [product.created_at])

  const handleVariantSelect = (variantThumbnail: string | null) => {
    if (variantThumbnail) {
      setDisplayedImage(variantThumbnail)
    }
  }

  const imageHeightClass = layout === 'carousel' ? 'h-[285px]' : 'h-[180px]'

  return (
    <Box
      className="group flex h-full flex-col overflow-hidden rounded-none border border-basic-primary/[0.12] shadow-lg bg-primary transition-all duration-300 hover:border-basic-primary/[0.12] hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:shadow-xl dark:hover:shadow-black/20"
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
        onVariantSelect={handleVariantSelect}
      />
    </Box>
  )
})

function ProductInfo({
  product,
  onVariantSelect,
}: {
  product: any
  onVariantSelect: (img: string | null) => void
}) {
  const optionsToRender = useMemo(() => {
    // Filter options we want to show (e.g. Color, Temperature)
    // For now, show all options that have values.
    if (!product.options || !product.variants) return []

    return product.options.map((opt: any) => {
      // Get unique values for this option
      const values = Array.from(new Set(product.variants.map((v: any) => {
        const val = v.options.find((o: any) => o.option_id === opt.id)?.value
        return val
      }))).filter(Boolean)

      return {
        ...opt,
        values
      }
    }).filter((o: any) => o.values.length > 0)
  }, [product])

  const handleOptionClick = (e: any, optionId: string, value: string) => {
    e.preventDefault();
    // Find variant with this option value
    const variant = product.variants.find((v: any) =>
      v.options.some((o: any) => o.option_id === optionId && o.value === value)
    )

    if (variant && variant.thumbnail) {
      onVariantSelect(variant.thumbnail)
    }
  }

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
          <div className="flex flex-wrap gap-2 mt-2">
            {optionsToRender.map((opt: any) => (
              opt.values.slice(0, 4).map((val: string) => {
                const style = getVariantStyle(val);
                return (
                  <button
                    key={`${opt.id}-${val}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation(); // Stop propagation to prevent link navigation
                      handleOptionClick(e, opt.id, val)
                    }}
                    title={val}
                    className={`h-6 min-w-[24px] px-2 rounded-full border text-[10px] font-bold shadow-sm transition-all hover:scale-110 flex items-center justify-center
                        ${style.background ? '' : 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 hover:bg-gray-100'}
                    `}
                    style={style.background ? { background: style.background, color: style.color, borderColor: 'rgba(0,0,0,0.1)' } : {}}
                  >
                    {val}
                  </button>
                )
              })
            ))}
          </div>
        )}

        <ProductPrice calculatedPrice={product.calculatedPrice} />
      </div>
    </Box>
  )
}