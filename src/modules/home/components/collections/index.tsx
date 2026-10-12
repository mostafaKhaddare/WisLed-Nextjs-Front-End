'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { SectionHeading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { CollectionsData } from 'types/strapi'

/**
 * Collection tile matching the mega-menu card: a rounded image panel with a
 * legibility gradient, the title in Sora-weight bold, a clamped description and
 * a "Découvrir" pill that fades in on hover. No hover-darkening overlay, which
 * is what the previous home tile used.
 */
const CollectionTile = ({
  title,
  handle,
  imgSrc,
  description,
}: {
  title: string
  handle: string
  imgSrc: string
  description: string
}) => {
  return (
    <LocalizedClientLink
      href={`/collections/${encodeURIComponent(handle)}`}
      className="group block"
    >
      <Box className="relative h-[180px] overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:shadow-xl small:h-[260px]">
        <Image
          src={imgSrc}
          alt={`${title} collection image`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          loading="lazy"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
        />

        {/* Legibility wash — always on, never darkened on hover. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <Box className="absolute inset-0 flex flex-col justify-between p-5 small:p-6">
          <div className="flex justify-end">
            <span className="translate-y-[-4px] rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-black/90 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-black/60 dark:text-white">
              Découvrir →
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-sora text-lg font-bold leading-tight text-white drop-shadow-md small:text-xl">
              {title}
            </h3>
            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-white/75">
              {description}
            </p>
          </div>
        </Box>
      </Box>
    </LocalizedClientLink>
  )
}
const Collections = ({
  cmsCollections,
  medusaCollections,
  headingDescription,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
  headingDescription?: React.ReactNode
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const validCollections = useMemo(() => {
    if (!cmsCollections.data.length || !medusaCollections.length) return null
    const collections = cmsCollections.data.filter((cmsCollection) =>
      medusaCollections.some(
        (medusaCollection) => medusaCollection.handle === cmsCollection.Handle
      )
    )
    if (!collections || collections.length < 1) return null
    return collections.sort((a, b) => b.id - a.id)
  }, [cmsCollections, medusaCollections])

  const collectionsToShow = useMemo(() => {
    if (!validCollections) return []
    return isExpanded ? validCollections : validCollections.slice(0, 4)
  }, [validCollections, isExpanded])

  if (!validCollections) return null

  return (
    <Container>
      {/* 1. Place the Heading here, above the grid */}
      <SectionHeading as="h2" accent>
        Acheter par application
      </SectionHeading>
      {headingDescription && (
        <div className="mt-2 text-secondary text-sm">
          {headingDescription}
        </div>
      )}

      {/* 2. Flexible Grid */}
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2 large:grid-cols-2 xl:grid-cols-2">
        {/* Adjusted to 2 cols for better visuals for collections, or maybe 4? User said 4 items. 
             If 4 items, 2x2 grid is standard. If I change to 4 cols, they might be small. 
             Let's use responsive: 1 col mobile, 2 cols tablet, 2 cols desktop?
             The previous code had grid-cols-2 small:grid-cols-2.
             Let's use grid-cols-1 small:grid-cols-2.
         */}
        {collectionsToShow.map((element, id) => (
          <CollectionTile
            key={id}
            title={element.Title}
            handle={element.Handle}
            imgSrc={element.Image.url}
            description={element.Description}
          />
        ))}
      </div>

      {/* 3. Toggle Button */}
      {validCollections.length > 4 && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="tonal"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-w-[150px]"
          >
            {isExpanded ? 'Voir moins' : 'Voir plus'}
          </Button>
        </div>
      )}
    </Container>
  )
}

export default Collections
