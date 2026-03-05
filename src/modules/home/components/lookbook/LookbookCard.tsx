'use client'

import React from 'react'
import { StoreProduct } from '@medusajs/types'


interface LookbookProductData {
    hotspot: {
        product_handle: string
        position_x: number
        position_y: number
    }
    product?: StoreProduct
}

interface LookbookCardProps {
    image_url: string
    title: string
    products: LookbookProductData[]
    regionId: string
    onProductClick: (productHandle: string) => void
}

const LookbookCard: React.FC<LookbookCardProps> = ({
    image_url,
    products,
    onProductClick,
}) => {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
            <img
                src={image_url}
                alt="Lookbook"
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
            />

            {products.map((item, index) => (
                <div
                    key={index}
                    className="absolute z-10 -ml-3 -mt-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-125 animate-pulse-slow"
                    style={{
                        left: `${item.hotspot.position_x}%`,
                        top: `${item.hotspot.position_y}%`,
                    }}
                    onClick={() => onProductClick(item.hotspot.product_handle)}
                >
                    <div className="h-2 w-2 rounded-full bg-fg-primary" />

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 mb-3 hidden w-64 -translate-x-1/2 transform rounded-lg border border-ui-border-base bg-ui-bg-base p-3 shadow-xl transition-all duration-200 ease-out sm:block opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto origin-bottom scale-95 group-hover:scale-100 z-20">
                        {item.product ? (
                            <div className="flex items-start gap-3">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
                                    {item.product.thumbnail && (
                                        <img
                                            src={item.product.thumbnail}
                                            alt={item.product.title}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col justify-between py-0.5">
                                    <span className="line-clamp-2 text-sm font-medium leading-tight text-ui-fg-base">
                                        {item.product.title}
                                    </span>
                                    {item.product.variants?.[0]?.calculated_price?.calculated_amount ? (
                                        <span className="mt-1 text-sm font-semibold text-fg-primary">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.product.variants[0].calculated_price.calculated_amount)}
                                        </span>
                                    ) : (
                                        <span className="mt-1 text-xs text-ui-fg-muted">
                                            Prix indisponible
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4">
                                <span className="animate-pulse text-xs text-gray-500">
                                    Chargement...
                                </span>
                            </div>
                        )}
                        {/* Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform border-b border-r border-gray-100 bg-white shadow-sm"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default LookbookCard
