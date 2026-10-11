'use client'

import Image from 'next/image'

import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Heading } from '@modules/common/components/heading'

type InnovationCardProps = {
  /**
   * Photo shown across the top of the panel. When absent the card falls back to
   * the navy wash, so the section never renders as an empty box.
   */
  image?: { url: string; alternativeText?: string } | null
}

/**
 * "À propos" panel for the home page.
 *
 * Geometry and palette come from the design mock: a 28px-radius panel with the
 * photo across the top, an eyebrow label, a Sora heading, body copy, and a
 * white pill CTA pinned to the bottom.
 */
const InnovationCard = ({ image }: InnovationCardProps) => {
  return (
    <section
      aria-labelledby="innovation-heading"
      className="relative mx-4 overflow-hidden rounded-[28px] bg-[#0F1B33] text-white small:mx-6"
    >
      {/* Photo plate. `aria-hidden` because the heading below carries the
          meaning — the picture is decorative here. */}
      {image && (
        <div className="relative h-[190px] w-full small:h-[240px]">
          <Image
            src={image.url}
            alt={image.alternativeText || 'Solutions d’éclairage LED Wisled'}
            fill
            sizes="(max-width: 900px) 100vw, 720px"
            priority={false}
            className="object-cover object-center"
          />
          {/* Keeps the copy legible where it meets the photo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B33] via-[#0F1B33]/25 to-transparent" />
        </div>
      )}

      <div className="relative px-[22px] pb-[34px] pt-6 small:px-7 small:pb-9 small:pt-7">
        <span className="block font-jakarta text-xs font-bold uppercase leading-none tracking-[0.12em] text-[#9DBAFF]">
          À propos
        </span>

        <Heading
          as="h2"
          id="innovation-heading"
          className="mt-4 font-sora text-[26px] font-bold leading-[1.15] tracking-[-0.01em] text-white"
        >
          Innovation &amp; Design
        </Heading>

        <p className="mt-4 max-w-[430px] font-jakarta text-[15px] leading-[1.55] text-[#D3DAEA]">
          Transformez chaque espace grâce à une technologie d&apos;éclairage
          durable, économique et moderne.
        </p>

        <LocalizedClientLink
          href="/about-us"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-3xl bg-white px-6 font-jakarta text-[15px] font-bold leading-none text-[#0F1B33] transition-colors hover:bg-[#EDF1FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9DBAFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B33]"
        >
          À propos de nous
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default InnovationCard
