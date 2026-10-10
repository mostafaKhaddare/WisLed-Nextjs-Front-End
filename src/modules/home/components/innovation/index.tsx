'use client'

import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Heading } from '@modules/common/components/heading'

/**
 * "À propos" panel for the home page.
 *
 * Geometry and palette are taken from the design mock: a 28px-radius dark navy
 * panel with a blue LED-strip decoration bleeding out of the bottom-right
 * corner, an eyebrow label, a Sora heading, body copy, and a white pill CTA.
 */
const InnovationCard = () => {
  return (
    <section
      aria-labelledby="innovation-heading"
      className="relative isolate mx-4 overflow-hidden rounded-[28px] px-[22px] pb-[34px] pt-7 text-white small:mx-6 small:px-7 small:pb-9 small:pt-9"
      style={{
        background:
          'radial-gradient(120% 80% at 85% 100%, #1B2A5E 0%, #0F1B33 62%)',
      }}
    >
      {/*
        LED-strip decoration. Two bars rotated -14deg, anchored to the right edge
        so they bleed out of the panel exactly as in the mock. `pointer-events-none`
        and `aria-hidden` because they are pure decoration.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute right-[-30px] top-[44px] h-[14px] w-[230px] rounded-[7px]"
          style={{
            background: '#7FA6FF',
            boxShadow: '0 0 60px 22px rgba(89,140,255,0.55)',
            transform: 'rotate(-14deg)',
          }}
        />
        <div
          className="absolute right-[-60px] top-[96px] h-[10px] w-[260px] rounded-[5px]"
          style={{
            background: '#B3CCFF',
            boxShadow: '0 0 50px 16px rgba(137,170,255,0.4)',
            transform: 'rotate(-14deg)',
          }}
        />
      </div>

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
    </section>
  )
}

export default InnovationCard
