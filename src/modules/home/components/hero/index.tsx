'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

import { Button } from '@modules/common/components/button'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'

interface HeroProps {
  data: HeroBanner
  autoplayDelay?: number
  transitionDuration?: number
}

/** Reassurance chips shown under the mobile hero panel. */
const TRUST_CHIPS = [
  'Livraison 24-48h',
  'Paiement sécurisé',
  'Garantie 2 ans',
]

/**
 * Copy used when the CMS is offline or the fields are empty, so the mobile
 * panel never renders a blank heading.
 */
const HEADLINE_FALLBACK = 'Illuminez vos espaces avec un éclairage sur mesure'
const TEXT_FALLBACK = 'Découvrez des solutions d’éclairage économes en énergie.'



const Hero = ({
  data,
  autoplayDelay = 5000,
  transitionDuration = 35
}: HeroProps) => {
  const { Headline, Text: text, CTA, Image: bannerImage } = data

  // Fall back to designed copy so the mobile panel is never blank when Strapi
  // is unreachable or a field was left empty in the CMS.
  const headline = Headline || HEADLINE_FALLBACK
  const body = text || TEXT_FALLBACK

  // Normalize images to array; filter out nulls (Strapi offline fallback)
  const images = useMemo(
    () => {
      const raw = Array.isArray(bannerImage) ? bannerImage : [bannerImage]
      return raw.filter(Boolean) as { url: string; alternativeText?: string }[]
    },
    [bannerImage]
  )
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

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
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
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
  useEffect(() => {
    if (!emblaApi || !hasMultipleImages) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        scrollNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [emblaApi, hasMultipleImages, scrollPrev, scrollNext])

  return (
    <>
      {/*
        Desktop banner carousel. Hidden below `large` because the mobile hero
        panel below replaces it entirely — keeping both visible would duplicate
        the H1 and show two competing calls to action.
      */}
      <Box className="relative hidden h-[360px] max-h-screen w-full overflow-hidden small:h-[400px] large:block large:h-[600px] 2xl:h-screen 2xl:max-h-[600px]">
        {/* Carousel Container */}
        <div
          className="h-full w-full"
          ref={hasMultipleImages ? emblaRef : null}
          role="region"
          aria-label="Hero banner carousel"
          aria-live="polite"
        >
          <div className="flex h-full">
            {hasImages ? (
              images.map((image, index) => (
                <div
                  key={image.url || index}
                  className="relative h-full w-full shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${images.length}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alternativeText || `Hero banner ${index + 1}`}
                    className="h-full w-full object-cover"
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    quality={90}
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                </div>
              ))
            ) : (
              /* CSS-only gradient fallback when Strapi is offline */
              <div className="relative h-full w-full shrink-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)',
                  }}
                />
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                  <div className="absolute -right-20 bottom-0 h-[350px] w-[350px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}
          </div>

          {/* Navigation Arrows (Desktop) */}
          {hasMultipleImages && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 large:block"
                aria-label="Previous slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 large:block"
                aria-label="Next slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Content Overlay for Large Screens */}
          <div className="absolute bottom-0 left-0 z-20 hidden w-full p-8 large:block">
            <Container className="!p-0">
              <div className="flex max-w-[500px] flex-col gap-4 text-white drop-shadow-lg xl:max-w-[600px]">
                <Heading
                  as="h1"
                  className="text-3xl font-bold leading-tight xl:text-5xl"
                >
                  {Headline}
                </Heading>
                <Text size="lg" className="text-lg font-medium">
                  {text}
                </Text>
                <div className="flex gap-6 pt-2">
                  <Button size="md" asChild className="w-max">
                    <LocalizedClientLink href={CTA.BtnLink}>
                      {CTA.BtnText}
                    </LocalizedClientLink>
                  </Button>
                </div>
              </div>
            </Container>
          </div>

          {/* Navigation Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {/* Play/Pause Button */}
              <button
                onClick={toggleAutoplay}
                className="mr-2 rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Dot indicators */}
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === selectedIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}

          {/* Slide counter (optional) */}
          {hasMultipleImages && (
            <div className="absolute right-4 top-4 z-20 rounded-full bg-black/30 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </Box>

      {/*
        ─── Mobile hero ───
        The banner carousel is desktop-only. On touch the mock is a self
        contained dark panel: navy radial wash, two LED-strip bars bleeding off
        the top-right, an eyebrow, the CMS headline and copy, a primary and a
        secondary action, and a small trust-chip strip underneath.
      */}
      <Box className="large:hidden">
        <Box className="!px-0">
          <section
            className="relative mx-4 mt-4 flex min-h-[410px] flex-col justify-end gap-3.5 overflow-hidden rounded-[28px] px-[22px] pb-[26px] text-white"
            style={{
              background:
                'radial-gradient(120% 80% at 80% 100%, #3B2A0E 0%, #0F1B33 62%)',
            }}
          >
            {/* LED-strip decoration, rotated and cropped by the panel. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
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

            <span className="relative font-jakarta text-xs font-bold uppercase leading-none tracking-[0.12em] text-[#FFC857]">
              Solutions LED Projet &amp; Maison
            </span>

            <Heading
              as="h1"
              className="relative font-sora text-[32px] font-bold leading-[1.12] tracking-[-0.01em] text-white"
            >
              {headline}
            </Heading>

            {body && (
              <Text className="relative font-jakarta text-[15px] leading-[1.5] text-[#D3DAEA]">
                {body}
              </Text>
            )}

            <div className="relative mt-1 flex flex-wrap gap-2.5">
              <Button
                size="md"
                asChild
                className="h-12 rounded-3xl bg-[#FFC857] px-[22px] font-jakarta text-[15px] font-bold text-[#1B1303] hover:bg-[#FFD37A]"
              >
                <LocalizedClientLink href={CTA.BtnLink}>
                  {CTA.BtnText}
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

            {/* Slide position indicator — decorative, the CMS carousel owns it. */}
            <div aria-hidden="true" className="relative mt-1.5 flex gap-1.5">
              <span className="h-1 w-[26px] rounded-sm bg-[#FFC857]" />
              <span className="h-1 w-3 rounded-sm bg-white/35" />
            </div>
          </section>
        </Box>

        {/* Trust strip — horizontally scrollable, as in the mock. */}
        <div className="mt-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRUST_CHIPS.map((chip) => (
            <div
              key={chip}
              className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_#E4E7EF] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#FFC857] shadow-[0_0_10px_3px_rgba(255,200,87,0.6)]"
              />
              <span className="whitespace-nowrap font-jakarta text-[13px] font-semibold text-[#0F1B33] dark:text-white">
                {chip}
              </span>
            </div>
          ))}
        </div>
      </Box>
    </>
  )
}

export default Hero