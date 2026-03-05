'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { StoreProduct } from '@medusajs/types'
import { Inspiration, STRAPI_API_URL, getAttributes } from '@lib/data/strapi'
import { sdk } from '@lib/config'
import { useRouter } from 'next/navigation'
import { Container } from '@modules/common/components/container'

import MasonryGrid from './MasonryGrid'
import LookbookCard from './LookbookCard'
import LookbookTabs from './LookbookTabs'

const INITIAL_LIMIT = 6

const ANIMATION_CSS = `
  @keyframes lookbook-card-in {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .lookbook-card-animate {
    opacity: 0;
    animation: lookbook-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
`

const LookbookSection = ({
    regionId,
    inspirations,
}: {
    regionId: string
    inspirations: Inspiration[]
}) => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('All')
    const [isVisible, setIsVisible] = useState(true)
    const [gridKey, setGridKey] = useState(0)
    const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT)
    const [currentApiUrl, setCurrentApiUrl] = useState(STRAPI_API_URL)
    const [productsData, setProductsData] = useState<Record<string, StoreProduct>>({})

    // ── Inject CSS once ───────────────────────────────────────────────────────
    useEffect(() => {
        if (document.getElementById('lookbook-anim-styles')) return
        const tag = document.createElement('style')
        tag.id = 'lookbook-anim-styles'
        tag.textContent = ANIMATION_CSS
        document.head.appendChild(tag)
    }, [])

    // ── Fix localhost for mobile preview ──────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return
        let base = STRAPI_API_URL
        if (base.includes('localhost')) base = base.replace('localhost', window.location.hostname)
        if (base.includes('127.0.0.1')) base = base.replace('127.0.0.1', window.location.hostname)
        setCurrentApiUrl(base)
    }, [])

    // ── Fetch Medusa products for hotspots ────────────────────────────────────
    useEffect(() => {
        const fetchProducts = async () => {
            if (!inspirations?.length) return
            const handles = new Set<string>()
            inspirations.forEach((insp) => {
                const attrs = getAttributes(insp)
                attrs?.hotspots?.forEach((h: any) => {
                    if (h.product_handle) handles.add(h.product_handle)
                })
            })
            if (!handles.size) return
            try {
                const { products } = await sdk.store.product.list({
                    handle: Array.from(handles),
                    region_id: regionId,
                    fields: '*variants.calculated_price,+variants.inventory_quantity,+thumbnail,+title,+handle,*variants,*options',
                })
                const map: Record<string, StoreProduct> = {}
                products.forEach((p) => { map[p.handle!] = p })
                setProductsData(map)
            } catch (err) {
                console.error('Failed to fetch products from Medusa', err)
            }
        }
        if (inspirations.length && regionId) fetchProducts()
    }, [inspirations, regionId])

    // ── Tabs from Strapi room_type values ─────────────────────────────────────
    const tabs = useMemo(() => {
        const types = new Set<string>()
        inspirations.forEach((insp) => {
            const attrs = getAttributes(insp)
            if (attrs?.room_type) types.add(attrs.room_type)
        })
        return ['All', ...Array.from(types).sort()]
    }, [inspirations])

    // ── 2-phase tab switch: fade-out → swap → staggered fade-in ──────────────
    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return
        setIsVisible(false)
        setTimeout(() => {
            setActiveTab(tab)
            setVisibleCount(INITIAL_LIMIT)   // reset to 6 on every tab switch
            setGridKey((k) => k + 1)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true))
            })
        }, 220)
    }

    // ── Filtered + sliced lists ───────────────────────────────────────────────
    const filteredInspirations = useMemo(
        () =>
            activeTab === 'All'
                ? inspirations
                : inspirations.filter((i) => {
                    const attrs = getAttributes(i)
                    return attrs?.room_type === activeTab
                }),
        [inspirations, activeTab]
    )

    const visibleInspirations = filteredInspirations.slice(0, visibleCount)
    const hasMore = filteredInspirations.length > visibleCount

    if (!inspirations?.length) return null

    return (
        <section className="bg-white dark:bg-gray-900 transition-colors duration-300">
            <Container>
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        Inspirations
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Inspirez-vous de nos réalisations et trouvez les produits exacts utilisés pour créer
                        ces ambiances uniques.
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <LookbookTabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabChange} />
                </div>

                {/* Grid wrapper — handles the smooth exit fade */}
                <div
                    style={{
                        transition: 'opacity 220ms ease, transform 220ms ease',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                        willChange: 'opacity, transform',
                    }}
                >
                    <MasonryGrid key={gridKey}>
                        {visibleInspirations.map((item: any, index) => {
                            const attrs = getAttributes(item)
                            if (!attrs) return null

                            let imageData = attrs.image
                            if (imageData?.data) imageData = imageData.data
                            if (Array.isArray(imageData) && imageData.length > 0) imageData = imageData[0]
                            let imageUrl = imageData?.attributes?.url ?? imageData?.url ?? ''
                            if (imageUrl && !imageUrl.startsWith('http')) {
                                imageUrl = `${currentApiUrl}${imageUrl}`
                            }

                            return (
                                <div
                                    key={item.id}
                                    className="mb-6 break-inside-avoid lookbook-card-animate"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                >
                                    <LookbookCard
                                        image_url={imageUrl}
                                        title={attrs.title}
                                        regionId={regionId}
                                        onProductClick={(handle) => router.push(`/products/${handle}`)}
                                        products={(attrs.hotspots || []).map((h: any) => ({
                                            hotspot: {
                                                product_handle: h.product_handle,
                                                position_x: h.position_x,
                                                position_y: h.position_y,
                                            },
                                            product: productsData[h.product_handle],
                                        }))}
                                    />
                                    <h3 className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        {attrs.title}
                                    </h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {attrs.room_type}
                                    </div>
                                </div>
                            )
                        })}
                    </MasonryGrid>

                    {/* Show more / show less */}
                    {filteredInspirations.length > INITIAL_LIMIT && (
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() =>
                                    hasMore
                                        ? setVisibleCount((c) => c + 6)
                                        : setVisibleCount(INITIAL_LIMIT)
                                }
                                className="px-8 py-3 rounded-full border border-gray-300 dark:border-white/20 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 shadow-sm hover:shadow-md hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-300"
                            >
                                {hasMore
                                    ? `Voir plus · ${filteredInspirations.length - visibleCount} restants`
                                    : 'Voir moins'}
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {filteredInspirations.length === 0 && (
                        <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                            Aucune inspiration disponible pour ce type d&apos;espace.
                        </div>
                    )}
                </div>
            </Container>
        </section>
    )
}

export default LookbookSection
