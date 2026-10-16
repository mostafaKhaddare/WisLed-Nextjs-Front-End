'use client'

import React, { useCallback, useEffect, useState } from 'react'
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

    // Vertical vs. horizontal gesture splitting is handled entirely in CSS by
    // `touch-action: pan-y` on `.embla__viewport` and `.lookbook-card`. The
    // browser scrolls the page for vertical drags and hands horizontal drags
    // to Embla, so no JS direction detection is needed. (The previous
    // `overflow: visible` toggle was a workaround for a card-level
    // `touch-action: pan-x`, which has since been corrected.)

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
                    vertical scrolling and lets Embla handle horizontal dragging. The cards
                    carry the same `pan-y`, so a finger that lands on an image still scrolls
                    the page.

                    The crossfade is opacity-only on purpose. A `will-change: transform` here
                    (or a transform in the wrapper style) promotes this subtree to its own
                    compositing layer on mobile Safari, which silently kills scroll chaining:
                    the page stops scrolling as soon as a finger lands on a slide. Only the
                    opacity is ever animated, so the layer is never needed.
                */}
                <div
                    ref={emblaRef}
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
