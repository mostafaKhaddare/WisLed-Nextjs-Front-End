import { MetadataRoute } from 'next'

import { getBaseURL } from '@lib/util/env'

export default function robots(): MetadataRoute.Robots {
    // `getBaseURL()` is the same source `metadataBase`, canonical tags and the
    // sitemap use, so the advertised sitemap URL always matches the live host.
    const baseUrl = getBaseURL()

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Private, non-indexable areas.
            disallow: ['/account', '/checkout', '/cart'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
