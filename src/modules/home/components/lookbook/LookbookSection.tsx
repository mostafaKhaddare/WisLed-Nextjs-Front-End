'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { StoreProduct } from '@medusajs/types'
import { Inspiration, STRAPI_API_URL, getAttributes } from '@lib/data/strapi'
import { sdk } from '@lib/config'
import { useRouter } from 'next/navigation'
import { Container } from '@modules/common/components/container'

import LookbookCard from './LookbookCard'
import LookbookCarousel from './LookbookCarousel'
import LookbookTabs from './LookbookTabs'

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
            setGridKey((k) => k + 1)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true))
            })
        }, 220)
    }

    // ── Filtered list ────────────────────────────────────────────────────────
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

    if (!inspirations?.length) return null

    return (
        <section className="bg-primary transition-colors duration-300">
            <Container>
                <LookbookCarousel
                    title="Inspirations"
                    description="Inspirez-vous de nos réalisations et trouvez les produits exacts utilisés pour créer ces ambiances uniques."
                    headerAside={<LookbookTabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabChange} />}
                    slideCount={filteredInspirations.length}
                    visible={isVisible}
                >
                    {/* Basis stays under 100%/n so the next card always peeks in. */}
                    <div className="embla__container flex gap-3 small:gap-4">
                        {filteredInspirations.map((item: any, index) => {
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
                                    // Re-keying replays the entrance stagger on tab switch. Embla
                                    // holds a reference to the track itself, so the key must stay
                                    // on the slides, never on the track.
                                    key={`${gridKey}-${item.id}`}
                                    className="lookbook-card-animate min-w-0 flex-[0_0_76%] small:flex-[0_0_45%] medium:flex-[0_0_36%] large:flex-[0_0_29%] xl:flex-[0_0_25%] 2xl:flex-[0_0_21%]"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                >
                                    <LookbookCard
                                        image_url={imageUrl}
                                        title={attrs.title}
                                        subtitle={attrs.room_type}
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
                                </div>
                            )
                        })}
                    </div>
                </LookbookCarousel>

                {/* Empty state */}
                {filteredInspirations.length === 0 && (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                        Aucune inspiration disponible pour ce type d&apos;espace.
                    </div>
                )}
            </Container>
        </section>
    )
}

export default LookbookSection
