'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

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

    return (
        <div>
            <div className="flex items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-basic-primary small:text-4xl large:text-5xl">
                        {title}
                    </h2>

                    {description && (
                        <div className="mt-4 text-sm text-basic-primary/70 small:text-base">
                            {description}
                        </div>
                    )}

                    {/* Angled accent bar — drawn with CSS, no image asset. */}
                    <div
                        aria-hidden="true"
                        className="relative mt-6 h-1.5 w-24 overflow-hidden rounded-full bg-fg-secondary"
                    >
                        <span className="absolute inset-y-0 left-0 w-2/3 origin-left rounded-full bg-gradient-to-r from-action-primary to-brand-400 [transform:skewX(-20deg)]" />
                    </div>
                </div>

                {/* Arrows are redundant next to swipe on small screens. */}
                {hasOverflow && (
                    <div className="hidden shrink-0 gap-2 small:flex">
                        <Button
                            withIcon
                            variant="filled"
                            className={arrowClass}
                            aria-label="Inspirations précédentes"
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                        >
                            <ArrowLeftIcon />
                        </Button>
                        <Button
                            withIcon
                            variant="filled"
                            className={arrowClass}
                            aria-label="Inspirations suivantes"
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                        >
                            <ArrowRightIcon />
                        </Button>
                    </div>
                )}
            </div>

            {/* Full row width so the room-type pill row is not squeezed into the
                heading measure — it scrolls on its own when the list is long. */}
            {headerAside && <div className="mt-8">{headerAside}</div>}

            {/*
                The viewport clips the track, so the page itself never scrolls sideways.
                `embla__viewport` / `embla__container` come from globals.css — the container
                class is what carries `touch-action: pan-x`, without which the browser
                steals the horizontal swipe for page scrolling on touch devices.
            */}
            <div
                ref={emblaRef}
                className="embla__viewport mt-10 overflow-hidden"
                style={{
                    transition: 'opacity 220ms ease, transform 220ms ease',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(10px)',
                    // Stop clicks reaching the outgoing slides mid tab-switch.
                    pointerEvents: visible ? 'auto' : 'none',
                    willChange: 'opacity, transform',
                }}
            >
                {children}
            </div>
        </div>
    )
}

export default LookbookCarousel
