'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

import { Button } from '@modules/common/components/button'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'
import { ArrowLeftIcon, ArrowRightIcon } from '@modules/common/icons'

interface HeroProps {
  data: HeroBanner
  autoplayDelay?: number
  transitionDuration?: number
}

/**
 * Copy used when the CMS is offline or the fields are empty, so the hero never
 * renders a blank heading.
 */
const HEADLINE_FALLBACK = 'Illuminez vos espaces avec un éclairage sur mesure'
const TEXT_FALLBACK =
  "Découvrez des solutions d'éclairage économes en énergie."

/**
 * A photo plus the copy that belongs to it.
 *
 * The CMS `Slides` rows travel together, but the original hero model kept a
 * single headline beside a multi-image upload — so a slide is also synthesised
 * from that shape, giving every image the shared headline until per-slide copy
 * is filled in.
 */
type Slide = {
  imgSrc?: string
  alt: string
  headline: string
  body?: string
  btnText?: string
  btnLink?: string
}

/** Decorative CSS-only artwork for a slide with no photo yet. */
const HeroArtwork = () => (
  <div className="relative h-full w-full shrink-0">
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(120% 80% at 80% 100%, #3B2A0E 0%, #0F1B33 62%)',
      }}
    />
    {/* Decorative LED strips */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-[-30px] top-[44px] h-[14px] w-[230px] rounded-[7px]"
        style={{
          background: '#FFC15A',
          boxShadow: '0 0 60px 22px rgba(255,170,40,0.55)',
          transform: 'rotate(-14deg)',
        }}
      />
      <div
        className="absolute right-[-60px] top-[96px] h-[10px] w-[260px] rounded-[5px]"
        style={{
          background: '#FFE2A8',
          boxShadow: '0 0 50px 16px rgba(255,200,100,0.4)',
          transform: 'rotate(-14deg)',
        }}
      />
    </div>
  </div>
)

const Hero = ({
  data,
  autoplayDelay = 5000,
  transitionDuration = 35,
}: HeroProps) => {
  const { Headline, Text: text, CTA, Image: bannerImage, Slides } = data

  // Normalize the legacy multi-image upload to an array, dropping nulls.
  const legacyImages = useMemo(() => {
    const raw = Array.isArray(bannerImage) ? bannerImage : [bannerImage]
    return raw.filter(Boolean) as { url: string; alternativeText?: string }[]
  }, [bannerImage])

  /**
   * Prefer the CMS `Slides` rows — each carries its own photo, headline and
   * button. Fall back to the original shape (one headline shared by every
   * image) so content that has not been migrated keeps working unchanged, and
   * finally to a single CSS-gradient slide when the CMS is unreachable.
   */
  const slides = useMemo<Slide[]>(() => {
    if (Slides?.length) {
      const fromCms = Slides.map((slide, index) => {
        const raw = Array.isArray(slide.Image) ? slide.Image : [slide.Image]
        const image = raw.find(Boolean) as
          | { url: string; alternativeText?: string }
          | undefined

        return {
          imgSrc: image?.url,
          alt:
            image?.alternativeText ||
            slide.Headline ||
            `Diapositive ${index + 1}`,
          headline: slide.Headline,
          body: slide.Text,
          btnText: slide.BtnText,
          btnLink: slide.BtnLink,
        }
        // A row without a heading has nothing readable to show.
      }).filter((slide) => Boolean(slide.headline))

      if (fromCms.length) return fromCms
    }

    const shared = {
      headline: Headline || HEADLINE_FALLBACK,
      body: text || TEXT_FALLBACK,
      btnText: CTA?.BtnText,
      btnLink: CTA?.BtnLink,
    }

    if (legacyImages.length) {
      return legacyImages.map((image, index) => ({
        imgSrc: image.url,
        alt: image.alternativeText || `Hero banner ${index + 1}`,
        ...shared,
      }))
    }

    return [{ alt: '', ...shared }]
  }, [Slides, Headline, text, CTA, legacyImages])

  const hasMultipleImages = slides.length > 1

  // Initialize Embla carousel with conditional autoplay
  const autoplayPlugin = useMemo(
    () =>
      hasMultipleImages
        ? [
            Autoplay({
              delay: autoplayDelay,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]
        : [],
    [hasMultipleImages, autoplayDelay]
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: transitionDuration,
      align: 'start',
      watchDrag: hasMultipleImages,
    },
    autoplayPlugin
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Handle slide selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Set up event listeners
  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // Navigation functions
  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
      const autoplay = emblaApi?.plugins()?.autoplay
      if (autoplay) autoplay.reset()
    },
    [emblaApi]
  )

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
    const autoplay = emblaApi?.plugins()?.autoplay
    if (autoplay) autoplay.reset()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
    const autoplay = emblaApi?.plugins()?.autoplay
    if (autoplay) autoplay.reset()
  }, [emblaApi])

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    if (isPlaying) {
      autoplay.stop()
    } else {
      autoplay.play()
    }
    setIsPlaying(!isPlaying)
  }, [emblaApi, isPlaying])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasMultipleImages) return
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          scrollPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          scrollNext()
          break
        case 'Home':
          e.preventDefault()
          scrollTo(0)
          break
        case 'End':
          e.preventDefault()
          scrollTo(slides.length - 1)
          break
        case ' ':
          e.preventDefault()
          toggleAutoplay()
          break
      }
    },
    [hasMultipleImages, slides.length, scrollTo, scrollPrev, scrollNext, toggleAutoplay]
  )

  return (
    <>
      {/*
        Rounded hero panel. The carousel supplies the photo AND the copy behind
        it: each slide owns its heading and primary button, so they travel
        together instead of a fixed headline sitting over sliding photos.
      */}
       <Box className="relative mx-4 mt-4 small:mx-6">
         <Box
           className="group relative h-[440px] overflow-hidden rounded-[28px] medium:h-[478px]"
           tabIndex={hasMultipleImages ? 0 : undefined}
           onKeyDown={handleKeyDown}
         >
          {/* Carousel track */}
          <div
            className="h-full w-full"
            ref={hasMultipleImages ? emblaRef : null}
            role="region"
            aria-label="Hero banner carousel"
            aria-live="polite"
            aria-roledescription="carousel"
          >
            <div className="flex h-full">
              {slides.map((slide, index) => {
                const isVisible =
                  !hasMultipleImages || index === selectedIndex

                return (
                  <div
                    key={slide.imgSrc || index}
                    className="relative h-full w-full shrink-0"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${slides.length}`}
                  >
                    {slide.imgSrc ? (
                      <>
                        <Image
                          src={slide.imgSrc}
                          alt={slide.alt}
                          className="h-full w-full object-cover object-right-top"
                          fill
                          sizes="100vw"
                          priority={index === 0}
                          quality={90}
                          draggable={false}
                        />
                        {/* Dark wash so the copy stays legible over any photo. */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B33] via-[#0F1B33]/45 to-transparent" />
                      </>
                    ) : (
                      <HeroArtwork />
                    )}

                    {/*
                      Per-slide copy. Sits inside the slide, so it moves with its
                      photo, and fades in once the slide is the selected one.
                    */}
                    <div
                      aria-hidden={!isVisible}
                      className={`absolute inset-0 z-20 flex flex-col justify-end gap-3.5 p-6 transition-all duration-500 ease-out small:gap-4 ${
                        isVisible
                          ? 'translate-y-0 opacity-100'
                          : 'pointer-events-none translate-y-3 opacity-0'
                      }`}
                    >
                      <span className="font-jakarta text-xs font-bold uppercase leading-none tracking-[0.12em] text-[#FFC857]">
                        Solutions LED Projet &amp; Maison
                      </span>

                      <Heading
                        as="h1"
                        className="max-w-[420px] font-sora text-[32px] font-bold leading-[1.12] tracking-[-0.01em] text-white"
                      >
                        {slide.headline}
                      </Heading>

                      {slide.body && (
                        <Text className="max-w-[300px] font-jakarta text-[15px] leading-[1.5] text-white/85">
                          {slide.body}
                        </Text>
                      )}

                      <div className="flex flex-wrap gap-2.5 small:gap-3">
                        <Button
                          size="md"
                          asChild
                          className="h-12 rounded-3xl bg-[#FFC857] px-[22px] font-jakarta text-[15px] font-bold text-[#1B1303] hover:bg-[#FFD37A]"
                        >
                          <LocalizedClientLink
                            href={slide.btnLink || CTA?.BtnLink || '/'}
                          >
                            {slide.btnText || CTA?.BtnText}
                          </LocalizedClientLink>
                        </Button>
                        <Button
                          size="md"
                          asChild
                          variant="tonal"
                          className="h-12 rounded-3xl border border-white/40 bg-transparent px-5 font-jakarta text-[15px] font-semibold text-white hover:bg-white/10"
                        >
                          <LocalizedClientLink href="/categories">
                            Par application
                          </LocalizedClientLink>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation: arrows + progress dots, shared by every slide */}
            {hasMultipleImages && (
              <>
                {/* Arrow buttons - only show on hover/focus for cleaner look */}
                <div className="absolute top-1/2 right-0 z-30 flex -translate-y-1/2 flex-col gap-2 pr-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 sm:opacity-100 sm:group-hover:opacity-100">
                  <button
                    onClick={scrollPrev}
                    aria-label="Diapositive précédente"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    aria-label="Diapositive suivante"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress bar + dots */}
                <div className="absolute bottom-0 left-0 right-0 z-30 h-1">
                  <div className="relative h-1 w-full bg-white/20">
                    <div
                      className="absolute top-0 left-0 h-1 bg-[#FFC857] transition-all duration-300"
                      style={{
                        width: `${((selectedIndex + 1) / slides.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {slides.map((slide, index) => {
                      const isActive = index === selectedIndex
                      const isAdjacent =
                        Math.abs(index - selectedIndex) <= 1

                      return (
                        <button
                          key={slide.imgSrc || index}
                          onClick={() => scrollTo(index)}
                          aria-label={`Aller à la diapositive ${index + 1}`}
                          aria-current={isActive ? 'true' : 'false'}
                          className={`relative h-2 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-8 bg-[#FFC857]'
                              : isAdjacent
                              ? 'w-3 bg-white/60 hover:bg-white/80'
                              : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Autoplay toggle, only meaningful with more than one slide */}
          {hasMultipleImages && (
            <button
              onClick={toggleAutoplay}
              className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}
        </Box>
       </Box>
     </>
  )
}

export default Hero
