'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { CollectionsData } from 'types/strapi'

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
    <Box
      className={cn('group relative overflow-hidden h-[180px] small:h-[300px] w-full', {
        // You can keep your grid span logic here if you had any
      })}
    >
      <Image
        src={imgSrc}
        alt={`${title} collection image`}
        width={600}
        height={300}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
      />

      {/* --- ADDED OVERLAY HERE --- */}
      {/* bg-black/20 = default dark tint (20% opacity)
          group-hover:bg-black/50 = darkens on hover (50% opacity)
          transition-colors duration-500 = smooth animation
      */}
      <div className="absolute inset-0 bg-black/30 transition-all duration-500 group-hover:bg-black/50" />
      {/* -------------------------- */}

      <Box className="absolute left-0 top-0 hidden h-full w-full flex-col p-6 small:flex large:p-10">
        <Button
          asChild
          className="w-max self-end transition-all duration-500 ease-in-out large:opacity-0 large:group-hover:opacity-100"
        >
          <LocalizedClientLink href={`/collections/${encodeURIComponent(handle)}`}>
            Découvrir
          </LocalizedClientLink>
        </Button>
        <Box className="mt-auto text-static">
          <Heading as="h3" className="mt-auto text-2xl text-white large:text-3xl">
            {title}
          </Heading>
          <Text
            size="lg"
            className="line-clamp-2 text-white/80 transition-all duration-500 ease-in-out large:h-0 large:opacity-0 large:group-hover:h-12 large:group-hover:opacity-100"
          >
            {description}
          </Text>
        </Box>
      </Box>
      <Box className="absolute left-0 top-0 block h-full w-full p-6 small:hidden large:p-10">
        <LocalizedClientLink
          href={`/collections/${encodeURIComponent(handle)}`}
          className="flex h-full w-full flex-col justify-end"
        >
          <Heading as="h3" className="text-2xl text-white large:text-3xl">
            {title}
          </Heading>
        </LocalizedClientLink>
      </Box>
    </Box>
  )
}
const Collections = ({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
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
      <Heading
        as="h2"
        className="mb-8 text-2xl font-bold text-basic-primary small:text-3xl"
      >
        Acheter par application
      </Heading>

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
            imgSrc={process.env.NEXT_PUBLIC_STRAPI_URL + element.Image.url}
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
