import { type CollectionCard } from '@lib/util/collection-image'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

import { CollectionTile } from '../components/collection-tile'

/**
 * "Nos collections" index — lists every collection as a themed tile.
 *
 * Data is assembled in the route
 * (`src/app/[countryCode]/(main)/collections/page.tsx`): Medusa supplies the
 * catalogue, the CMS supplies the copy and a fallback image, and
 * `buildCollectionCards` merges both. This template is intentionally
 * presentational so it stays trivial to reuse.
 *
 * The hero mirrors the collection detail page (`Heading as="h1"` scaled up) and
 * reuses `SectionHeading`'s accent bar tokens, so the listing and a single
 * collection read as one family.
 */
export default function CollectionListTemplate({
  collections,
}: {
  collections: CollectionCard[]
}) {
  return (
    <Container className="flex flex-col gap-8 !py-8">
      <StoreBreadcrumbs breadcrumb="Collections" />

      <div className="flex flex-col gap-3">
        <Heading
          as="h1"
          className="text-4xl font-bold text-basic-primary small:text-5xl"
        >
          Nos collections
        </Heading>
        <div
          aria-hidden="true"
          className="h-1.5 w-24 min-w-[80px] max-w-[120px] origin-left rounded-full bg-gradient-to-r from-wisled-500 to-wisled-400 [transform:skewX(-20deg)]"
        />
        <p className="text-md text-secondary small:text-lg">
          Explorez toutes nos collections thématiques et trouvez l&apos;éclairage
          adapté à chaque projet.
        </p>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 small:grid-cols-2 xl:grid-cols-3">
          {collections.map((card) => (
            <CollectionTile key={card.handle} card={card} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Text size="lg" className="font-semibold text-basic-primary">
            Aucune collection pour le moment
          </Text>
          <Text size="sm" className="text-secondary">
            Revenez bientôt : de nouvelles collections arrivent.
          </Text>
        </div>
      )}
    </Container>
  )
}
