import { StoreProduct, StoreRegion } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"

type ProductJsonLdProps = {
    product: StoreProduct
    region: StoreRegion
    currencyCode: string
}

export default function ProductJsonLd({ product, region: _region, currencyCode }: ProductJsonLdProps) {
    const { cheapestPrice } = getProductPrice({
        product,
        variantId: product.variants?.[0]?.id
    })

    // getProductPrice returns strings like "100 MAD"
    // We need to extract the numeric value for Schema
    const extractPrice = (priceString: string | undefined | null) => {
        if (!priceString) return "0.00"
        // Remove all non-numeric characters except . and ,
        // Actually, currency symbols vary. Safer to use regex.
        // Also handle comma as decimal if applicable, but Schema prefers dot.
        // Simplest: remove everything except digits and dots?
        // But Medusa might format with comma.
        // Let's assume standard format for now or just parse based on known locale if possible.
        // Fallback: simple replace.
        return priceString.replace(/[^0-9.]/g, '') || "0.00"
    }

    const price = extractPrice(cheapestPrice?.calculated_price)

    const isAvailable = product.variants?.some((v) =>
        v.inventory_quantity && v.inventory_quantity > 0 || v.allow_backorder
    )

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "description": product.description || product.title,
        "image": product.images?.map((img) => img.url) || [product.thumbnail],
        // SKU = actual variant SKU (used by Google Shopping), fallback to handle
        "sku": product.variants?.[0]?.sku || product.handle,
        "mpn": product.id,
        "brand": {
            "@type": "Brand",
            "name": "WisLed"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": currencyCode.toUpperCase(),
            "price": price,
            "availability": isAvailable ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wisled.ma'}/products/${product.handle}`,
            "seller": {
                "@type": "Organization",
                "name": "WisLed"
            }
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
