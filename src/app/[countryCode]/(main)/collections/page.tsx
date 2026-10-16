import { Metadata } from 'next'

import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/cms'
import { buildCollectionCards } from '@lib/util/collection-image'
import CollectionListTemplate from '@modules/collections/templates/collection-list'

export const metadata: Metadata = {
  title: 'Nos collections',
  description:
    'Découvrez toutes les collections Wisled : éclairage LED, rubans, profilés, contrôle et bien plus.',
}

/**
 * Collections index ("Voir toutes") — the page the navigation mega-menu links
 * to at `/{countryCode}/collections`.
 *
 * Medusa is the catalogue source of truth; Payload only supplies the copy and a
 * fallback image per handle. Both fetchers degrade to empty on their own, so the
 * page still renders (with an empty state) when either backend is unreachable.
 * `includeUncurated` lists every Medusa collection, matching the "see all"
 * intent — ones without artwork get the branded placeholder tile.
 */
export default async function CollectionsPage() {
  const [{ collections: medusaCollections }, cmsCollections] = await Promise.all(
    [getCollectionsList(), getCollectionsData()]
  )

  const collections = buildCollectionCards(
    cmsCollections.data,
    medusaCollections,
    { includeUncurated: true }
  )

  return <CollectionListTemplate collections={collections} />
}
