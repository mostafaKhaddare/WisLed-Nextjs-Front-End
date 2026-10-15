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
        // The track deliberately shows a sliver of the next card, so snaps are
        // allowed to land between cards instead of forcing whole-slide jumps.
        skipSnaps: true,
        loop: false,
    })
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    const viewportRef = useRef<HTMLDivElement>(null)
    const touchStart = useRef<{ x: number; y: number } | null>(null)
    const isDragging = useRef(false)

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

    // ── Touch scroll fix ──────────────────────────────────────────────
    // On mobile, when the user touches the carousel image and tries to scroll
    // vertically, the carousel viewport intercepts the touch and the page
    // stops scrolling. This handler detects the primary drag direction:
    //   - If the drag is predominantly vertical → release to the page
    //     (temporarily set touch-action to pan-y so Embla doesn't fight it)
    //   - If the drag is predominantly horizontal → let Embla handle it
    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const handleTouchStart = (e: TouchEvent) => {
            // Only track single-touch drags
            if (e.touches.length !== 1) return
            const touch = e.touches[0]
            touchStart.current = { x: touch.clientX, y: touch.clientY }
            isDragging.current = false
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStart.current || e.touches.length !== 1) return
            const touch = e.touches[0]
            const dx = Math.abs(touch.clientX - touchStart.current.x)
            const dy = Math.abs(touch.clientY - touchStart.current.y)

            // 3px threshold — below this we can't tell the direction
            const THRESHOLD = 3
            if (dx > THRESHOLD || dy > THRESHOLD) {
                isDragging.current = true
            }

            // If vertical movement exceeds horizontal, the user is trying
            // to scroll the page. Release the touch by switching to pan-y
            // so the browser hands the gesture to the page, not Embla.
            if (dy > dx && dy > THRESHOLD) {
                viewport.style.touchAction = 'pan-y'
            } else if (dx > dy && dx > THRESHOLD) {
                // Horizontal drag — let the carousel own it
                viewport.style.touchAction = 'none'
            }
        }

        const handleTouchEnd = () => {
            touchStart.current = null
            isDragging.current = false
            // Reset to pan-x when the gesture ends so horizontal swipe
            // works again on the next interaction.
            viewport.style.touchAction = 'pan-x'
        }

        // Use passive listeners so we never block the browser's native scroll.
        viewport.addEventListener('touchstart', handleTouchStart, { passive: true })
        viewport.addEventListener('touchmove', handleTouchMove, { passive: true })
        viewport.addEventListener('touchend', handleTouchEnd, { passive: true })
        viewport.addEventListener('touchcancel', handleTouchEnd, { passive: true })

        return () => {
            viewport.removeEventListener('touchstart', handleTouchStart)
            viewport.removeEventListener('touchmove', handleTouchMove)
            viewport.removeEventListener('touchend', handleTouchEnd)
            viewport.removeEventListener('touchcancel', handleTouchEnd)
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
                    `embla__viewport` / `embla__container` come from globals.css — the container
                    class is what carries `touch-action: pan-x`, without which the browser
                    steals the horizontal swipe for page scrolling on touch devices.

                    The crossfade is opacity-only on purpose. A `will-change: transform` here
                    (or a transform in the wrapper style) promotes this subtree to its own
                    compositing layer on mobile Safari, which silently kills scroll chaining:
                    the page stops scrolling as soon as a finger lands on a slide. Only the
                    opacity is ever animated, so the layer is never needed.
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
                    style={{ touchAction: 'pan-x' }}
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
