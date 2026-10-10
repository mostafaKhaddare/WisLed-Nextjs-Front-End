'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@lib/util/cn'
import { HttpTypes } from '@medusajs/types'

import { WishlistButton } from '../product-tile/action'
import { NAVY, PHOTO_GRADIENT } from '../product-tile/design-tokens'
import { LoadingImage } from '../product-tile/loading-image'
import { GalleryDialog } from './gallery-dialog'

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
  /**
   * Optional product identity. When supplied the mock's "Nouveau" badge and
   * white wishlist disc are overlaid on the hero shot, which is where the
   * design puts them.
   */
  productHandle?: string
  regionId?: string
  thumbnail?: string | null
  productId?: string
  isNew?: boolean
}

const ImageGallery = ({
  images,
  title,
  productHandle,
  regionId,
  thumbnail,
  productId,
  isNew = false,
}: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const showChrome = Boolean(productHandle && regionId)

  const handleOpenDialog = useCallback((index: number) => {
    setSelectedImage(index)
  }, [])

  const onThumbClick = useCallback((index: number) => {
    setSelectedIndex(index)
    const track = trackRef.current
    if (!track) return
    const slide = track.children[index] as HTMLElement | undefined
    slide?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [])

  // Native horizontal scrolling does the swiping; this only works out which
  // slide ended up centred so the thumbnail ring follows the gesture.
  const handleTrackScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const track = trackRef.current
      if (!track) return

      const bounds = track.getBoundingClientRect()
      const centre = bounds.left + bounds.width / 2

      let best = 0
      let bestDistance = Infinity
      Array.from(track.children).forEach((child, i) => {
        const rect = (child as HTMLElement).getBoundingClientRect()
        const distance = Math.abs(rect.left + rect.width / 2 - centre)
        if (distance < bestDistance) {
          bestDistance = distance
          best = i
        }
      })

      setSelectedIndex(best)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!images.length) return null

  return (
    <div className="flex w-full flex-col gap-3">
      {/* ─── Hero shot ─────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-[20px] small:rounded-[26px]"
        style={{ background: PHOTO_GRADIENT }}
      >
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => handleOpenDialog(index)}
              aria-label={`Agrandir ${title} — vue ${index + 1}`}
              className="relative aspect-[358/300] w-full shrink-0 snap-center cursor-zoom-in small:aspect-[16/13]"
            >
              <LoadingImage
                src={image.url}
                alt={`${title} - view ${index + 1}`}
                sizes="(max-width: 900px) 100vw, 620px"
                priority={index === 0}
                quality={90}
                className="h-full w-full object-contain p-4 small:p-6"
              />
            </button>
          ))}
        </div>

        {/* Badges — mock places them on the hero, not above it. */}
        {showChrome && (
          <>
            {isNew && (
              <span
                className="pointer-events-none absolute left-3.5 top-3.5 z-10 inline-flex h-[25.2px] items-center rounded-xl px-2.5 font-jakarta text-xs font-bold leading-none text-white small:left-5 small:top-5"
                style={{ backgroundColor: NAVY }}
              >
                Nouveau
              </span>
            )}
            <WishlistButton
              productHandle={productHandle!}
              regionId={regionId!}
              thumbnail={thumbnail || undefined}
              title={title}
              productId={productId}
              className="!right-3.5 !top-3.5 small:!right-5 small:!top-5"
            />
          </>
        )}
      </div>

      {/* ─── Thumbnail strip ────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 py-0.5 small:gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onThumbClick(index)}
              aria-label={`Voir ${title} — image ${index + 1}`}
              aria-current={index === selectedIndex}
              className={cn(
                'relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-2xl transition-opacity',
                'small:h-[76px] small:w-[76px] small:rounded-[16px]',
                index === selectedIndex
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{
                background: PHOTO_GRADIENT,
                // A 1.6px inset ring reads as the selected state without
                // changing the tile's box model, so the strip never reflows.
                ...(index === selectedIndex
                  ? { boxShadow: `inset 0 0 0 1.6px ${NAVY}` }
                  : {}),
              }}
            >
              <LoadingImage
                src={image.url}
                alt={`${title} — miniature ${index + 1}`}
                sizes="80px"
                loading="lazy"
                className="h-full w-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      <GalleryDialog
        activeImg={selectedImage}
        onChange={setSelectedImage}
        images={images}
        title={title}
      />
    </div>
  )
}

export default ImageGallery
