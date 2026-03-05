import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * Strapi Webhook → Next.js On-Demand Cache Revalidation
 * ────────────────────────────────────────────────────────────────────────────
 * Configure in Strapi Admin → Settings → Webhooks → Create:
 *
 *   URL:     https://your-domain.com/api/revalidate
 *   Headers: x-revalidate-secret: <your secret from .env>
 *   Events:  entry.create, entry.update, entry.delete, entry.publish,
 *            entry.unpublish, media.create, media.update, media.delete
 *
 * The webhook body from Strapi includes a `model` field (e.g. "inspiration",
 * "homepage", "blog") that we use to selectively invalidate only the affected
 * tags — no full-site rebuild needed.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Map Strapi content-type UIDs / model names → Next.js cache tags
const MODEL_TO_TAGS: Record<string, string[]> = {
    // Lookbook / inspirations
    'inspiration': ['inspirations'],
    'api::inspiration.inspiration': ['inspirations'],

    // Homepage sections
    'homepage': ['hero-banner', 'mid-banner'],
    'api::homepage.homepage': ['hero-banner', 'mid-banner'],

    // Collections
    'collection': ['collections-main'],
    'api::collection.collection': ['collections-main'],

    // Categories
    'category': ['collections-main'],
    'api::category.category': ['collections-main'],

    // Blog
    'blog': ['explore-blog', 'blog', 'blog-slugs'],
    'api::blog.blog': ['explore-blog', 'blog', 'blog-slugs'],
    'blog-post-category': ['blog-categories'],
    'api::blog-post-category.blog-post-category': ['blog-categories'],

    // Static pages
    'about-u': ['about-us'],   // Strapi trims trailing 's' from some UIDs
    'about-us': ['about-us'],
    'api::about-u.about-u': ['about-us'],

    'faq': ['faq'],
    'api::faq.faq': ['faq'],

    'privacy-policy': ['privacy-policy'],
    'terms-and-condition': ['terms'],
    'contact-u': ['contact-us'],
    'contact-us': ['contact-us'],

    // Product variants (colours)
    'product-variants-color': ['variants-colors'],
    'api::product-variants-color.product-variants-color': ['variants-colors'],

    // Media library — invalidate everything (images changed)
    'file': ['hero-banner', 'mid-banner', 'inspirations', 'collections-main', 'explore-blog', 'blog'],
}

export async function POST(req: NextRequest) {
    // ── 1. Verify secret ────────────────────────────────────────────────────
    const secret = process.env.STRAPI_WEBHOOK_REVALIDATION_SECRET
    const incomingSecret = req.headers.get('x-revalidate-secret')

    if (!secret || incomingSecret !== secret) {
        console.warn('[Revalidate] Unauthorised webhook call — wrong or missing secret')
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // ── 2. Parse Strapi webhook body ────────────────────────────────────────
    let body: {
        event?: string
        model?: string
        uid?: string
        entry?: { id?: number }
    } = {}

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const strapiModel = (body.model || body.uid || '').toLowerCase()
    const event = body.event || 'unknown'

    console.log(`[Revalidate] Strapi event="${event}" model="${strapiModel}"`)

    // ── 3. Map model to cache tags ───────────────────────────────────────────
    const tagsToRevalidate: string[] = MODEL_TO_TAGS[strapiModel] ?? []

    if (tagsToRevalidate.length === 0) {
        // Unknown model → revalidate everything as a safe fallback
        console.warn(`[Revalidate] Unknown model "${strapiModel}" — revalidating ALL tags`)
        const allTags = new Set(Object.values(MODEL_TO_TAGS).flat())
        allTags.forEach((tag) => revalidateTag(tag))
        return NextResponse.json({
            revalidated: true,
            tags: Array.from(allTags),
            note: `Unknown model "${strapiModel}" — all tags cleared`,
        })
    }

    // ── 4. Revalidate specific tags ──────────────────────────────────────────
    tagsToRevalidate.forEach((tag) => {
        revalidateTag(tag)
        console.log(`[Revalidate] ✓ Cleared tag: ${tag}`)
    })

    return NextResponse.json({
        revalidated: true,
        model: strapiModel,
        event,
        tags: tagsToRevalidate,
        timestamp: new Date().toISOString(),
    })
}

// Prevent GET requests (Strapi only sends POST)
export async function GET() {
    return NextResponse.json({ status: 'Revalidation webhook active ✓' })
}
