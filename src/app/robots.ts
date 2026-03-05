import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wisled.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account', '/checkout', '/cart'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
