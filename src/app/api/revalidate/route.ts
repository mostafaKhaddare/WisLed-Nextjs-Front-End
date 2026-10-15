import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * Webhook → Next.js On-Demand Cache Revalidation
 * ────────────────────────────────────────────────────────────────────────────
 * Supports:
 *   - Strapi: Configure in Strapi Admin → Settings → Webhooks
 *   - Medusa: Configure in Medusa Admin → Settings → Webhooks
 *
 * Headers: x-revalidate-secret: <your secret from .env>
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
    'about-u': ['about-us'],
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

    // Medusa webhook events
    'product': ['products', 'collections-main'],
    'product.created': ['products', 'collections-main'],
    'product.updated': ['products', 'collections-main'],
    'product.deleted': ['products', 'collections-main'],
    'product_category': ['categories', 'collections-main'],
    'product_category.created': ['categories', 'collections-main'],
    'product_category.updated': ['categories', 'collections-main'],
    'product_category.deleted': ['categories', 'collections-main'],
}

export async function POST(req: NextRequest) {
    // ── 1. Verify secret ────────────────────────────────────────────────────
    const secret = process.env.STRAPI_WEBHOOK_REVALIDATION_SECRET
    const incomingSecret = req.headers.get('x-revalidate-secret')

    if (!secret || incomingSecret !== secret) {
        console.warn('[Revalidate] Unauthorised webhook call — wrong or missing secret')
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // ── 2. Parse webhook body (supports Strapi and Medusa formats) ──────────
    let body: any = {}

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Detect webhook type
    const isMedusa = typeof body.event_type === 'string' // Medusa uses event_type
    const isStrapi = typeof body.model === 'string' || typeof body.uid === 'string' // Strapi uses model/uid

    let modelKey = ''
    let event = 'unknown'

    if (isMedusa) {
        // Medusa format: { event_type: "product.created", data: { ... } }
        event = body.event_type
        // Extract model from event_type (e.g., "product.created" -> "product.created")
        modelKey = body.event_type.toLowerCase()
        console.log(`[Revalidate] Medusa event_type="${event}"`)
    } else if (isStrapi) {
        // Strapi format: { event: "entry.create", model: "api::product.product", ... }
        event = body.event || 'unknown'
        modelKey = (body.model || body.uid || '').toLowerCase()
        console.log(`[Revalidate] Strapi event="${event}" model="${modelKey}"`)
    } else {
        // Fallback: try to infer from body
        modelKey = (body.model || body.uid || body.event_type || '').toLowerCase()
        event = body.event || body.event_type || 'unknown'
        console.log(`[Revalidate] Unknown format event="${event}" model="${modelKey}"`)
    }

    // ── 3. Map model to cache tags ───────────────────────────────────────────
    const tagsToRevalidate: string[] = MODEL_TO_TAGS[modelKey] ?? []

    if (tagsToRevalidate.length === 0) {
        // Unknown model → revalidate everything as a safe fallback
        console.warn(`[Revalidate] Unknown model "${modelKey}" — revalidating ALL tags`)
        const allTags = new Set(Object.values(MODEL_TO_TAGS).flat())
        allTags.forEach((tag) => revalidateTag(tag))
        return NextResponse.json({
            revalidated: true,
            tags: Array.from(allTags),
            note: `Unknown model "${modelKey}" — all tags cleared`,
        })
    }

    // ── 4. Revalidate specific tags ──────────────────────────────────────────
    tagsToRevalidate.forEach((tag) => {
        revalidateTag(tag)
        console.log(`[Revalidate] ✓ Cleared tag: ${tag}`)
    })

    return NextResponse.json({
        revalidated: true,
        model: modelKey,
        event,
        tags: tagsToRevalidate,
        timestamp: new Date().toISOString(),
    })
}

// Prevent GET requests (Strapi only sends POST)
export async function GET() {
    return NextResponse.json({ status: 'Revalidation webhook active ✓' })
}
