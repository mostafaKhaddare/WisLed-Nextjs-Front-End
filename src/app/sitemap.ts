import { MetadataRoute } from 'next'
import { getProductsList } from '@lib/data/products'
import { listRegions } from '@lib/data/regions'

// Define the base URL from env or fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wisled.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const regions = await listRegions().catch(() => [])

    if (!regions || regions.length === 0) {
        return []
    }

    const sitemapEntries: MetadataRoute.Sitemap = []

    // Iterate through regions to generate localized URLs
    // Limit to first country of region to avoid duplicate content if multiple countries map to same region logic
    // or iterate all countries if distinct.
    // Medusa regions map to multiple countries.
    // We'll just take the first country for simplicity or iterate all.
    // Assuming 1-1 mapping for primary target market effectively.

    for (const region of regions) {
        const countryCode = region.countries?.[0]?.iso_2

        if (!countryCode) continue

        // Homepage
        sitemapEntries.push({
            url: `${baseUrl}/${countryCode}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        })

        // Fetch products for this region
        // Pagination limit might apply, explicitly fetch a reasonable batch (e.g. 100)
        // For a real production site with thousands of products, this should be paginated or optimized.
        const { response } = await getProductsList({
            countryCode: countryCode,
            queryParams: { limit: 100 }
        })

        const products = response.products

        products.forEach((product) => {
            sitemapEntries.push({
                url: `${baseUrl}/${countryCode}/products/${product.handle}`,
                lastModified: new Date(product.updated_at),
                changeFrequency: 'weekly',
                priority: 0.8,
            })
        })

        // Add static pages like About, Contact if needed (manually or dynamic)
        // sitemapEntries.push({ url: ..., priority: 0.5 })
    }

    return sitemapEntries
}
