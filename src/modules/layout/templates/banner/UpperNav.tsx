'use client'

import Link from 'next/link'

import { Button } from '@medusajs/ui'
import { Container } from '@modules/common/components/container'
import { HeadphonesIcon } from '@modules/common/icons'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { FaCogs, FaShippingFast, FaTools } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

const slides = [
  {
    icon: <FaShippingFast aria-hidden="true" className="h-3.5 w-3.5" />,
    text: 'Paiement à la livraison disponible',
  },
  {
    icon: <FaTools aria-hidden="true" className="h-3.5 w-3.5" />,
    text: 'Solutions LED projet & maison',
  },
  {
    icon: <FaCogs aria-hidden="true" className="h-3.5 w-3.5" />,
    text: 'Contrôleurs DMX & Smart LED',
  },
]

const actionLinkClassName =
  'group !h-7 !gap-0 !rounded-full !bg-transparent !p-0 !text-white !shadow-none hover:!bg-transparent focus-visible:!bg-transparent focus-visible:!shadow-none'

export default function UpperNavbar() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: false,
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  )

  return (
    <div
      data-testid="upper-nav"
      className="relative z-40 w-full border-b border-[#0F1B33]/30 bg-[#0F1B33] font-jakarta text-white"
    >
      {/* Fine luminous rule separating the utility strip from the main navbar. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFC857]/40 to-transparent"
          />

      <Container className="relative flex h-9 items-center justify-between gap-3 !px-4 !py-0 medium:!px-14">
        {/* Left: rotating service messages — the quiet, informative side of the bar. */}
        <div
          className="min-w-0 flex-1 overflow-hidden"
          ref={emblaRef}
          role="region"
          aria-label="Annonces WISLED"
        >
          <div className="flex touch-pan-y">
            {slides.map((slide) => (
              <div
                key={slide.text}
                className="flex min-w-0 flex-[0_0_100%] items-center gap-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFC857]/15 text-[#FFC857] ring-1 ring-inset ring-[#FFC857]/30">
                  {slide.icon}
                </span>
                <span className="truncate text-[11px] font-medium tracking-[0.01em] text-white/80">
                  {slide.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: direct contact — understated on mobile, complete on desktop. */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            size="small"
            variant="transparent"
            className={`${actionLinkClassName} hidden medium:inline-flex`}
          >
            <Link
              href="mailto:info@wisled.ma"
              aria-label="Envoyer un e-mail à info@wisled.ma"
              className="h-7 items-center gap-2 font-jakarta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-wisled-950"
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC857]/15 text-[#FFC857] ring-1 ring-inset ring-[#FFC857]/30 transition-colors duration-200 group-hover:bg-[#FFC857] group-hover:text-[#0F1B33]">
                  <MdEmail aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                <span className="hidden whitespace-nowrap text-[11px] font-medium tracking-[0.01em] text-white/80 transition-colors duration-200 group-hover:text-[#FFC857] large:inline">
                  info@wisled.ma
                </span>
            </Link>
          </Button>

          <span
            aria-hidden="true"
            className="hidden h-3.5 w-px bg-[#FFC857]/20 medium:block"
          />

          <Button
            asChild
            size="small"
            variant="transparent"
            className={actionLinkClassName}
          >
            <Link
              href="tel:+212648522511"
              aria-label="Appeler le +212 648 522 511"
              className="h-7 items-center gap-2 font-jakarta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC857]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B33]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC857]/15 text-[#FFC857] ring-1 ring-inset ring-[#FFC857]/30 transition-colors duration-200 group-hover:bg-[#FFC857] group-hover:text-[#0F1B33]">
                <HeadphonesIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span className="hidden whitespace-nowrap text-[11px] font-semibold tracking-[0.01em] text-white/85 transition-colors duration-200 group-hover:text-[#FFC857] small:inline">
                +212 648 522 511
              </span>
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}
