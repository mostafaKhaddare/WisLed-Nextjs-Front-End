'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

import { Button } from '@modules/common/components/button'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const Hero = ({ data }: { data: HeroBanner }) => {
  const { Headline, Text: text, CTA, Image: bannerImage } = data

  // Support both single image and array of images
  const images = Array.isArray(bannerImage) ? bannerImage : [bannerImage]
  const hasMultipleImages = images.length > 1

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 35,
      align: 'start',
    },
    hasMultipleImages ? [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })] : []
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

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

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  return (
    <>
      <Box className="relative h-[300px] max-h-screen w-full overflow-hidden small:h-[400px] large:h-[600px] 2xl:h-screen 2xl:max-h-[600px]">
        <div className="h-full w-full" ref={hasMultipleImages ? emblaRef : null}>
          <div className="flex h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  src={process.env.NEXT_PUBLIC_STRAPI_URL + image.url}
                  alt={image.alternativeText ?? `Banner image ${index + 1}`}
                  className="h-full w-full object-cover"
                  width={1000}
                  height={600}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Overlay for Large Screens */}
        <div className="absolute bottom-0 left-0 z-20 hidden w-full p-8 large:block">
          <Container className="!p-0">
            <div className="flex max-w-[500px] xl:max-w-[600px] flex-col gap-4 text-white">
              <Heading
                as="h2"
                className=" text-3xl xl:text-5xl font-bold leading-tight"
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
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Box>

      {/* Content for Small/Medium Screens (hidden on large) */}
      <Container className="flex flex-col gap-2 !py-4 small:gap-4 small:!py-6 large:hidden">
        <Heading as="h2" className="max-w-full text-2xl font-bold text-basic-primary small:max-w-[510px] medium:text-5xl">
          {Headline}
        </Heading>
        <Box className="flex flex-col-reverse justify-between gap-4 medium:flex-row medium:items-center">
          <Button size="md" asChild className="w-max">
            <LocalizedClientLink href={CTA.BtnLink}>
              {CTA.BtnText}
            </LocalizedClientLink>
          </Button>
          <Text
            size="lg"
            className="max-w-full text-basic-primary medium:max-w-[410px] medium:text-end"
          >
            {text}
          </Text>
        </Box>
      </Container>
    </>
  )
}

export default Hero