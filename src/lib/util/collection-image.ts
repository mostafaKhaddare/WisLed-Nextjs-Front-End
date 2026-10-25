/**
 * Collection card helpers shared by the homepage section and the navigation
 * mega-menu, so both agree on which collections to show and where the image
 * comes from.
 *
 * Medusa v2 collections have no image column, so a collection's artwork can
 * live in two places:
 *
 *   - Medusa itself, in the collection's free-form `metadata` object
 *     (`metadata.image`). This is editable straight from the Medusa admin's
 *     Metadata field, which is what makes a collection image manageable
 *     without the CMS.
 *   - The CMS (Payload), on the `collections` record whose `Handle` (or, when
 *     the handle has drifted, `Title`) matches the Medusa collection.
 *
 * Medusa wins when it carries an image so a collection can be fully managed
 * from the Medusa admin; the CMS image stays as the fallback for collections
 * that have not been migrated yet.
 */

/** The subset of a Medusa collection these helpers read. */
type MedusaCollectionLike = {
  title: string
  handle: string
  metadata: Record<string, unknown> | null
  created_at: string
}

/** The subset of a Payload `collections` record these helpers read. */
type CmsCollectionLike = {
  Title: string
  Handle: string
  Description: string
  Image?: { url?: string | null } | null
}

/**
 * Normalise a handle/title into a comparison key. Medusa handles are lowercase
 * and usually unaccented; older CMS records are not always, and one CMS handle
 * even contains a typo. Matching on both the handle and the title keeps those
 * records connected to their Medusa collection.
 */
const normalizeKey = (value: string | null | undefined) =>
  (value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Pick the most useful CMS record when two records resolve to the same key.
 * The CMS has a legacy duplicate collection whose short description is just the
 * title; the richer record is the one we want to display.
 */
const pickRicherCmsRecord = (
  existing: CmsCollectionLike | undefined,
  candidate: CmsCollectionLike
) =>
  !existing ||
  (candidate.Description?.trim().length ?? 0) >
    (existing.Description?.trim().length ?? 0)

export type CollectionCard = {
  title: string
  handle: string
  description: string
  /** `undefined` when neither Medusa nor the CMS has an image yet. */
  imgSrc?: string
  createdAt: string
}

/**
 * Resolve the image to display for a collection tile.
 *
 * Returns `undefined` when neither source has one, so callers can render a
 * neutral placeholder instead of a broken image.
 */
export function resolveCollectionImage(
  medusaImage: unknown,
  cmsImageUrl: string | null | undefined
): string | undefined {
  if (typeof medusaImage === 'string' && medusaImage.trim()) {
    return medusaImage.trim()
  }

  if (typeof cmsImageUrl === 'string' && cmsImageUrl.trim()) {
    return cmsImageUrl.trim()
  }

  return undefined
}

/**
 * Build the ordered list of collection cards to render.
 *
 * Collections come from Medusa (the catalogue source of truth). A collection is
 * included once it has been curated on *either* side:
 *
 *   - a matching Payload record (the historical way), or
 *   - an image on the Medusa collection's `metadata.image` (the direct way).
 *
 * Newest first, so a freshly created collection appears at the top.
 */
export function buildCollectionCards(
  cmsCollections: CmsCollectionLike[],
  medusaCollections: MedusaCollectionLike[],
  options: { includeUncurated?: boolean } = {}
): CollectionCard[] {
  const cmsByHandle = new Map<string, CmsCollectionLike>()
  const cmsByTitle = new Map<string, CmsCollectionLike>()

  for (const cmsCollection of cmsCollections) {
    const handleKey = normalizeKey(cmsCollection.Handle)
    const titleKey = normalizeKey(cmsCollection.Title)

    if (pickRicherCmsRecord(cmsByHandle.get(handleKey), cmsCollection)) {
      cmsByHandle.set(handleKey, cmsCollection)
    }

    if (pickRicherCmsRecord(cmsByTitle.get(titleKey), cmsCollection)) {
      cmsByTitle.set(titleKey, cmsCollection)
    }
  }

  const cards: CollectionCard[] = []

  for (const medusaCollection of medusaCollections) {
    const cmsCollection =
      cmsByHandle.get(normalizeKey(medusaCollection.handle)) ??
      cmsByTitle.get(normalizeKey(medusaCollection.title))
    const imgSrc = resolveCollectionImage(
      medusaCollection.metadata?.image,
      cmsCollection?.Image?.url
    )
    const metadataDescription =
      typeof medusaCollection.metadata?.description === 'string'
        ? medusaCollection.metadata.description.trim()
        : ''

    // Neither curated in the CMS nor carrying a Medusa image: skip it so the
    // curated sections (homepage, nav) only ever show intentionally published
    // collections. The dedicated collections index opts into `includeUncurated`
    // so every Medusa collection is listed — including ones still waiting for
    // artwork, which then render the branded placeholder tile.
    if (!cmsCollection && !imgSrc && !options.includeUncurated) continue

    cards.push({
      title: cmsCollection?.Title || medusaCollection.title,
      handle: medusaCollection.handle,
      description:
        cmsCollection?.Description?.trim() || metadataDescription || '',
      imgSrc,
      createdAt: medusaCollection.created_at,
    })
  }

  return cards.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
