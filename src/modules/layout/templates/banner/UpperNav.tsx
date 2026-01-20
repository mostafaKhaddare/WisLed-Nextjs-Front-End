"use client"

import { Container } from "@modules/common/components/container"
import { TfiHeadphoneAlt } from "react-icons/tfi"
import { MdEmail } from "react-icons/md"
import { FaShippingFast, FaTools, FaCogs } from "react-icons/fa"
import Link from "next/link"
import { Text } from '@modules/common/components/text'
import { Button } from "@medusajs/ui" // Kept as requested
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

export default function UpperNavbar() {
  const slides = [
    { icon: <FaShippingFast className="w-3 h-3 medium:w-4 medium:h-4" />, text: "Paiement à la livraison Disponible" },
    { icon: <FaTools className="w-3 h-3 medium:w-4 medium:h-4" />, text: "Solutions LED Projet & Maison" },
    { icon: <FaCogs className="w-3 h-3 medium:w-4 medium:h-4" />, text: "Contrôleurs DMX & Smart LED" },
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
    <div className="sticky top-0 z-50 py-2 bg-fg-primary text-white border-b border-white/10 overflow-hidden medium:!px-14">
      <Container className="flex items-center justify-between mx-auto max-w-full !py-0 relative gap-2">

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
                <Text className="text-[11px] font-bold medium:text-sm  tracking-wide whitespace-nowrap">
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
            <Button size="small" variant="transparent" className="!p-1.5 !h-auto shrink-0 bg-white/10 border-none text-white hover:bg-white/20">
               <MdEmail className="w-4 h-4" />
            </Button>
            <Text size="sm" className="hidden font-bold large:block group-hover:text-gray-200 transition-colors">
               info@wisled.ma
            </Text>
          </Link>

          {/* PHONE: Visible on all screens */}
          <Link
            href="tel:+212666650286"
            className="flex items-center gap-1.5 group"
          >
             {/* Keeping your Button design */}
            <Button size="small" variant="transparent" className="!p-1.5 !h-auto shrink-0 bg-white/10 border-none text-white hover:bg-white/20">
               <TfiHeadphoneAlt className="w-3.5 h-3.5" />
            </Button>

            <Text className="text-[11px] medium:text-sm font-bold tracking-wide whitespace-nowrap group-hover:text-gray-200 transition-colors">
               +212 648522511
            </Text>
          </Link>
        </div>

      </Container>
    </div>
  )
}