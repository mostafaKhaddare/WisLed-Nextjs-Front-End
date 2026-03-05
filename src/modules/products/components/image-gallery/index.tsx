'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@lib/util/cn'
import { HttpTypes } from '@medusajs/types'

import { LoadingImage } from '../product-tile/loading-image'
import { GalleryDialog } from './gallery-dialog'
import ImageCarousel from './image-carousel'

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // -- Embla Carousel Setup for Desktop --
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
  })
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    axis: 'y', // Vertical thumbnails
  })

  // Sync Thumbnails with Main Carousel
  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    emblaMainApi.on('select', onSelect)
    emblaMainApi.on('reInit', onSelect)

    return () => {
      emblaMainApi.off('select', onSelect)
      emblaMainApi.off('reInit', onSelect)
    }
  }, [emblaMainApi, onSelect])

  // Open Dialog handler
  const handleOpenDialog = (index: number) => {
    setSelectedImage(index)
  }

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      {/* ─── DESKTOP GALLERY (Medium+) ─── */}
      <div className="hidden medium:flex gap-4 h-[600px] w-full">
        {/* Thumbnails (Left) */}
        <div className="w-[100px] shrink-0 h-full relative">
          <div className="h-full overflow-hidden" ref={thumbViewportRef}>
            <div className="flex flex-col gap-3 backface-hidden touch-pan-y">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => onThumbClick(index)}
                  className={cn(
                    "relative aspect-[3/4] w-full overflow-hidden rounded-lg border transition-all duration-200 ease-in-out hover:opacity-100",
                    index === selectedIndex
                      ? "border-action-primary ring-1 ring-action-primary opacity-100 dark:border-white dark:ring-white"
                      : "border-transparent opacity-60 hover:border-gray-300"
                  )}
                >
                  <LoadingImage
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Image (Right) */}
        <div className="flex-1 h-full relative overflow-hidden rounded-2xl bg-secondary/10 border border-basic-primary/5 dark:bg-white/5 dark:border-white/5">
          <div className="h-full" ref={mainViewportRef}>
            <div className="flex h-full touch-pan-y backface-hidden">
              {images.map((image, index) => (
                <div
                  className="relative h-full min-w-0 flex-[0_0_100%]"
                  key={image.id}
                >
                  <LoadingImage
                    src={image.url}
                    alt={`${title} - view ${index + 1}`}
                    className="h-full w-full object-contain cursor-zoom-in"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onClick={() => handleOpenDialog(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE CAROUSEL (Small screens) ─── */}
      {/* Existing component handles rendering and hiding on large screens via CSS classes inside it */}
      <ImageCarousel images={images} openDialog={handleOpenDialog} />

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
