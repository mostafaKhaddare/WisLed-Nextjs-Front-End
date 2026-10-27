'use client'

import Image from 'next/image'

import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Heading } from '@modules/common/components/heading'

type InnovationCardProps = {
  image?: { url: string; alternativeText?: string } | null
}

const InnovationCard = ({ image }: InnovationCardProps) => {
  return (
    <section
      aria-labelledby="innovation-heading"
      className={`
        relative mx-4 overflow-hidden rounded-[28px] bg-[#0F1B33] text-white small:mx-6
        lg:max-w-[1200px] lg:mx-0 lg:px-40 lg:rounded-[32px] lg:py-0 lg:pt-0 lg:pb-0
      `}
    >
      {/* Desktop: dark gradient card with glowing LED strip decoration, 64px padding */}
      <div className="lg:hidden">
        {image && (
          <div className="relative h-[190px] w-full small:h-[240px]">
            <Image
              src={image.url}
              alt={image.alternativeText || "Solutions d'éclairage LED Wisled"}
              fill
              sizes="(max-width: 900px) 100vw, 720px"
              priority={false}
              className="object-cover object-center"
            />
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
      </div>

      {/* Desktop-only (>= 1024px): full-container card, dark gradient, glowing LED strip, 64px padding */}
      <div className="hidden lg:block">
        <div
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1D3F9A] to-[#0F1B33] text-white p-[64px]"
        >
          {/* Glowing LED strip decoration */}
          <div
            className="pointer-events-none absolute -top-[40px] -right-[60px] h-[16px] w-[280px] rounded-[8px]"
            style={{
              background: '#FFC857',
              boxShadow: '0 0 60px 22px rgba(255,200,87,0.6)',
              transform: 'rotate(-12deg)',
            }}
          />
          <div
            className="pointer-events-none absolute -top-[90px] -right-[120px] h-[12px] w-[320px] rounded-[6px]"
            style={{
              background: '#FFD37A',
              boxShadow: '0 0 50px 16px rgba(255,211,122,0.45)',
              transform: 'rotate(-12deg)',
            }}
          />

          <div className="relative z-10 max-w-[520px]">
            <span className="block font-sora text-[18px] font-bold uppercase leading-none tracking-[0.14em] text-[#FFC857]">
              À propos
            </span>

            <Heading
              as="h2"
              id="innovation-heading"
              className="mt-6 font-sora text-[42px] font-bold leading-[1.12] tracking-[-0.02em] text-white"
            >
              Innovation &amp; Design
            </Heading>

            <p className="mt-8 max-w-[520px] font-jakarta text-[18px] leading-[1.6] text-[#E8EEF7]">
              Transformez chaque espace grâce à une technologie d&apos;éclairage
              durable, économique et moderne.
            </p>

            <LocalizedClientLink
              href="/about-us"
              className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 py-0 font-sora text-[18px] font-bold text-[#0F1B33] transition-colors hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC857] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              À propos de nous
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InnovationCard
