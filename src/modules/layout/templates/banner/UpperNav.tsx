'use client'

import { Container } from '@modules/common/components/container'

import { MdEmail } from 'react-icons/md'
import { FaShippingFast, FaTools, FaCogs } from 'react-icons/fa'
import Link from 'next/link'
import { Text } from '@modules/common/components/text'
import { Button } from '@medusajs/ui' // Kept as requested
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { HeadphonesIcon } from '@modules/common/icons'

export default function UpperNavbar() {
  const slides = [
    {
      icon: <FaShippingFast className="h-3 w-3 medium:h-4 medium:w-4" />,
      text: 'Paiement à la livraison Disponible',
    },
    {
      icon: <FaTools className="h-3 w-3 medium:h-4 medium:w-4" />,
      text: 'Solutions LED Projet & Maison',
    },
    {
      icon: <FaCogs className="h-3 w-3 medium:h-4 medium:w-4" />,
      text: 'Contrôleurs DMX & Smart LED',
    },
  ]

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  return (
    <div className="sticky top-0 z-50 w-full overflow-hidden border-b border-white/10 bg-fg-primary py-2 text-white dark:border-white/5 dark:bg-[#0f1115] dark:text-slate-100">
      <Container className="flex items-center justify-between gap-2 !py-0">
        {/* --- LEFT: Banner Slider (Takes available space) --- */}
        <div className="flex-1 overflow-hidden min-w-0" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] flex items-center gap-2 pl-1"
              >
                {/* Icon wrapper to match design, but simple div to align with text */}
                <div className="opacity-90">{slide.icon}</div>

                {/* Text: Smaller on mobile (text-[11px]) to prevent overflow, normal on desktop */}
                <Text className="whitespace-nowrap text-[11px] font-bold tracking-wide medium:text-sm">
                  {slide.text}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: Actions (Buttons + Links) --- */}
        <div className="flex items-center gap-2 shrink-0">
          {/* EMAIL: Hidden on mobile, visible on desktop */}
          <Link
            href="mailto:info@wisled.ma"
            className="hidden medium:flex items-center gap-2 group"
          >
            {/* Keeping your Button design */}
            <Button
              size="small"
              variant="transparent"
              className="!h-auto shrink-0 border-none bg-white/10 !p-1.5 text-white hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <MdEmail className="h-4 w-4" />
            </Button>
            <Text
              size="sm"
              className="hidden font-bold transition-colors group-hover:text-gray-200 dark:group-hover:text-white/80 large:block"
            >
              info@wisled.ma
            </Text>
          </Link>

          {/* PHONE: Visible on all screens */}
          <Link
            href="tel:+212666650286"
            className="flex items-center gap-1.5 group"
          >
            {/* Keeping your Button design */}
            <Button
              size="small"
              variant="transparent"
              className="!h-auto shrink-0 border-none bg-white/10 !p-1.5 text-white hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <HeadphonesIcon className="h-4 w-4" />
            </Button>

            <Text className="whitespace-nowrap text-[11px] font-bold tracking-wide transition-colors group-hover:text-gray-200 dark:group-hover:text-white/80 medium:text-sm">
              +212 648522511
            </Text>
          </Link>
        </div>
      </Container>
    </div>
  )
}
