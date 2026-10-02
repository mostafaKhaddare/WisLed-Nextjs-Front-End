'use client'

import { cn } from '@lib/util/cn'
import Image from 'next/image'
import { ReactNode, useCallback, useEffect, useState } from 'react'

type ImageStatus = 'loading' | 'loaded' | 'error'

export const LoadingImage = ({
  src,
  alt,
  priority,
  loading,
  sizes,
  className,
  onClick,
  quality,
  fallbackSrc,
  fallback,
}: {
  src: string
  alt: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
  sizes?: string
  className?: string
  onClick?: () => void
  quality?: number
  /**
   * Tried when `src` fails to load. Variant thumbnails are frequently missing
   * or 404 in the CMS, and a broken image icon is worse than the product shot.
   */
  fallbackSrc?: string
  fallback?: ReactNode
}) => {
  const [status, setStatus] = useState<ImageStatus>('loading')
  const [resolvedSrc, setResolvedSrc] = useState(src)

  // Swapping the image (e.g. picking another variant) has to go back to the
  // loading state, otherwise the next image pops in already faded out.
  useEffect(() => {
    setResolvedSrc(src)
    setStatus('loading')
  }, [src])

  // A `priority` image, or one served from the HTTP cache, can finish decoding
  // before React attaches `onLoad`. Without this the skeleton sat on screen
  // forever on a tile whose image was already warm.
  const measureRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setStatus((prev) => (prev === 'loading' ? 'loaded' : prev))
    }
  }, [])

  const handleError = () => {
    if (fallbackSrc && resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc)
      return
    }

    setStatus('error')
  }

  return (
    <div className="relative h-full w-full overflow-hidden" onClick={onClick}>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-skeleton-primary"
        />
      )}

      {status === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
          {fallback}
        </div>
      ) : (
        // The fade lives on a wrapper rather than the <img> so a caller
        // supplying `transition-transform` (hover zoom) cannot merge the
        // opacity transition away.
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none',
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Image
            ref={measureRef}
            src={resolvedSrc}
            alt={alt}
            fill
            sizes={sizes}
            className={className}
            quality={quality}
            priority={priority}
            // `priority` and `loading` are mutually exclusive in next/image;
            // passing both triggers a build warning.
            loading={priority ? undefined : loading}
            decoding="async"
            onLoad={() => setStatus('loaded')}
            onError={handleError}
          />
        </div>
      )}
    </div>
  )
}
