import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'

export const Banner = ({ data }: { data: HeroBanner }) => {
  const { Image: bannerImage, CTA, Headline, Text: text } = data
  const image = Array.isArray(bannerImage) ? bannerImage[0] : bannerImage


  return (
    <Container>
      <Box className="relative h-[440px] medium:h-[478]">
        <Image
          src={process.env.NEXT_PUBLIC_STRAPI_URL + image.url}
          alt={image.alternativeText ?? 'Banner image'}
          fill
          className="object-cover object-right-top"
        />

        <div className="absolute inset-0 font-bold flex flex-col items-center justify-center px-10 text-center text-white">
          <Heading className="text-3xl xl:text-5xl">{Headline}</Heading>

          <Text size="lg" className="mt-2   medium:max-w-[600px]">
            {text}
          </Text>
          <Button variant='filled' className="mt-8" asChild>
            <LocalizedClientLink href={CTA.BtnLink}>
              {CTA.BtnText}
            </LocalizedClientLink>
          </Button>
        </div>
      </Box>
    </Container>
  )
}