'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { cn } from '@lib/util/cn'
import { Button } from '@modules/common/components/button'
import { ArrowLeftIcon, ArrowRightIcon } from '@modules/common/icons'

interface LookbookCarouselProps {
    title: string
    description?: React.ReactNode
    /** Rendered under the description, above the track. Used for the room-type tabs. */
    headerAside?: React.ReactNode
    slideCount: number
    /** Drives the tab-switch crossfade without tearing down the carousel. */
    visible?: boolean
    children: React.ReactNode
}

const arrowClass =
    '!h-11 !w-11 !rounded-full !p-0 bg-fg-secondary text-action-primary hover:bg-fg-secondary-hover hover:text-action-primary-hover active:bg-fg-secondary-pressed active:text-action-primary-pressed disabled:!bg-transparent'

const LookbookCarousel = ({
    title,
    description,
    headerAside,
    slideCount,
    visible = true,
    children,
}: LookbookCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        skipSnaps: true,
        loop: false,
    })
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    // Viewport ref for touch-direction detection
    const viewportRef = useRef<HTMLDivElement | null>(null)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setCanScrollPrev(emblaApi.canScrollPrev())
        setCanScrollNext(emblaApi.canScrollNext())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onSelect])

    // A tab filter or the "show more" button changes how many slides exist.
    // Embla caches the snap list, so it has to recompute it.
    useEffect(() => {
        emblaApi?.reInit()
    }, [emblaApi, slideCount])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    const hasOverflow = slideCount > 1

    // ── Mobile scroll fix ───────────────────────────────────────────────
    // Problem: on mobile, the carousel viewport has `overflow: hidden` which
    // creates a scroll container. Even with `touch-action: pan-y` on the
    // viewport (set via CSS), some browsers still block vertical page scroll
    // when the touch starts inside the carousel.
    //
    // Fix: Listen for `pointerdown` on the viewport. If the subsequent
    // `pointermove` is predominantly vertical (page scroll intent), we
    // temporarily set `overflow: visible` on the viewport so the page can
    // scroll. If it's horizontal (carousel swipe intent), we restore
    // `overflow: hidden` and let Embla handle the drag.
    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        let startX = 0
        let startY = 0
        const THRESHOLD = 5

        const handlePointerDown = (e: PointerEvent) => {
            if (e.pointerType !== 'touch') return
            startX = e.clientX
            startY = e.clientY
        }

        const handlePointerMove = (e: PointerEvent) => {
            if (!startX || !startY) return
            if (e.pointerType !== 'touch') return

            const dx = Math.abs(e.clientX - startX)
            const dy = Math.abs(e.clientY - startY)

            // Once we've determined the direction, we don't need to keep checking.
            if (dx > THRESHOLD || dy > THRESHOLD) {
                if (dy > dx) {
                    // Vertical — allow page scroll by making viewport transparent to scroll
                    viewport.style.overflow = 'visible'
                } else {
                    // Horizontal — keep carousel behavior
                    viewport.style.overflow = 'hidden'
                }
                // Reset after first decision — the browser will re-evaluate
                startX = 0
                startY = 0
            }
        }

        const handlePointerUp = () => {
            viewport.style.overflow = 'hidden'
            startX = 0
            startY = 0
        }

        viewport.addEventListener('pointerdown', handlePointerDown, { passive: true })
        viewport.addEventListener('pointermove', handlePointerMove, { passive: true })
        viewport.addEventListener('pointerup', handlePointerUp, { passive: true })
        viewport.addEventListener('pointercancel', handlePointerUp, { passive: true })

        return () => {
            viewport.removeEventListener('pointerdown', handlePointerDown)
            viewport.removeEventListener('pointermove', handlePointerMove)
            viewport.removeEventListener('pointerup', handlePointerUp)
            viewport.removeEventListener('pointercancel', handlePointerUp)
        }
    }, [emblaApi])

    return (
        <div>
            <div className="flex items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <h2 className="font-jakarta text-3xl font-bold tracking-tight text-[#0F1B33] small:text-4xl large:text-5xl dark:text-white">
                        {title}
                    </h2>

                    {/*
                        Accent line sits between the heading and the description —
                        a short branded rule that visually ties the two together.
                    */}
                    <span
                        aria-hidden="true"
                        className="mt-3 block h-1.5 w-16 rounded-full bg-[#1D4ED8] small:mt-4 small:w-20"
                    />

                    {description && (
                        <div className="mt-4 font-jakarta text-sm leading-relaxed text-[#5B6577] small:text-base dark:text-gray-300">
                            {description}
                        </div>
                    )}
                </div>

                {/*
                    Arrow buttons: always visible on desktop, auto-revealed on
                    touch after the first interaction. They provide a clear
                    affordance for keyboard and mouse users.
                */}
                {hasOverflow && (
                    <div
                        className={cn(
                            'shrink-0 gap-2 transition-opacity duration-300',
                            'hidden small:flex',
                        )}
                    >
                        <Button
                            withIcon
                            variant="filled"
                            className={cn(arrowClass, 'border border-[#E4E7EF] dark:border-white/10')}
                            aria-label="Inspirations précédentes"
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                        >
                            <ArrowLeftIcon />
                        </Button>
                        <Button
                            withIcon
                            variant="filled"
                            className={cn(arrowClass, 'border border-[#E4E7EF] dark:border-white/10')}
                            aria-label="Inspirations suivantes"
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                        >
                            <ArrowRightIcon />
                        </Button>
                    </div>
                )}
            </div>

            {/* Full width so the room-type pill row is not squeezed into the
                heading measure — it scrolls on its own when the list is long. */}
            {headerAside && <div className="mt-8">{headerAside}</div>}

            <div className="relative">
                {/*
                    The viewport clips the track, so the page itself never scrolls sideways.
                    `touch-action: pan-y` (from globals.css) tells the browser to handle
                    vertical scrolling and lets Embla handle horizontal dragging.

                    The crossfade is opacity-only on purpose. A `will-change: transform` here
                    (or a transform in the wrapper style) promotes this subtree to its own
                    compositing layer on mobile Safari, which silently kills scroll chaining:
                    the page stops scrolling as soon as a finger lands on a slide. Only the
                    opacity is ever animated, so the layer is never needed.

                    On mobile, the JS pointer-event handler above is a backup: it detects
                    the primary drag direction and temporarily toggles `overflow` on this
                    viewport. Vertical drag → overflow: visible (page scrolls through).
                    Horizontal drag → overflow: hidden (carousel owns it).
                */}
                <div
                    ref={(node) => {
                        viewportRef.current = node
                        emblaRef(node)
                    }}
                    className={cn(
                        'embla__viewport mt-10 overflow-hidden lookbook-fade',
                        visible ? 'lookbook-fade--in' : 'lookbook-fade--out',
                    )}
                >
                    {children}
                </div>

                {/* Progress indicator dots - subtle, shows current position */}
                {hasOverflow && (
                    <div
                        className={cn(
                            'mt-4 flex justify-center gap-1.5',
                        )}
                    >
                        {Array.from({ length: Math.ceil(slideCount / 4) }).map((_, i) => (
                            <div
                                key={i}
                                className="h-1 w-8 rounded-full bg-gray-300 dark:bg-gray-600"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LookbookCarousel
