/**
 * Cache invalidation for Payload writes.
 *
 * Before this existed, `src/app/api/revalidate/route.ts` was the only way to
 * clear a stale page — and it is Strapi-shaped: it keys off `model`/`uid`
 * values such as `api::inspiration.inspiration` and reads an
 * `x-revalidate-secret` header. Payload emits neither, so editors saving in the
 * admin never invalidated anything and the storefront kept serving stale HTML.
 *
 * These hooks make the CMS the trigger instead of an external webhook, using
 * the exact same tag names the storefront already fetches with, so no page
 * component had to change.
 */

/**
 * Payload slug -> Next.js cache tags.
 *
 * Keep these in sync with MODEL_TO_TAGS in src/app/api/revalidate/route.ts.
 */
export const CACHE_TAGS: Record<string, string[]> = {
  // Media can appear anywhere, so an upload clears the content-bearing tags.
  media: ['hero-banner', 'mid-banner', 'inspirations', 'collections-main', 'explore-blog', 'blog'],

  blogs: ['explore-blog', 'blog', 'blog-slugs'],
  'blog-post-categories': ['blog-categories'],
  inspirations: ['inspirations'],
  collections: ['collections-main'],
  categories: ['collections-main'],
  'product-variants-colors': ['variants-colors'],

  homepage: ['hero-banner', 'mid-banner'],
  'about-us': ['about-us'],
  'contact-us': ['contact-us'],
  faq: ['faq'],
  'privacy-policy': ['privacy-policy'],
  'terms-and-condition': ['terms'],
}

/**
 * Clear the tags for a collection/global slug.
 *
 * `next/cache` is imported dynamically and every failure is swallowed. The same
 * Payload config is loaded by standalone migration and verification scripts
 * that run outside a Next.js request, where `revalidateTag` has no static
 * generation store to talk to. Those writers must not crash the migration, and
 * a missing revalidation is always safe — it only costs freshness until the
 * next deploy.
 */
export const revalidateFor = async (slug: string): Promise<void> => {
  const tags = CACHE_TAGS[slug]
  if (!tags?.length) return

  try {
    const { revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag)
    console.log(`[revalidate] ${slug} -> ${tags.join(', ')}`)
  } catch (error) {
    console.log(
      `[revalidate] skipped for ${slug}: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    )
  }
}

/**
 * Build the `hooks` block for a collection or global.
 *
 * Spread straight into the config:
 *   hooks: revalidateHooks('blogs')
 *
 * Both write and delete clear the same tags: unpublishing or removing a blog
 * is exactly as capable of making a cached page wrong as editing it.
 */
export const revalidateHooks = (slug: string) => ({
  afterChange: [async () => void (await revalidateFor(slug))],
  afterDelete: [async () => void (await revalidateFor(slug))],
})