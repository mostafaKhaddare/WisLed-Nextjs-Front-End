'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { StoreCollection } from '@medusajs/types'
import { buildCollectionCards } from '@lib/util/collection-image'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { CollectionsData } from 'types/strapi'

export default function CollectionsMenu({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
}) {
  const newestCollections = useMemo(() => {
    if (!medusaCollections.length) return null
    const cards = buildCollectionCards(cmsCollections.data, medusaCollections)
    return cards.length ? cards.slice(0, 3) : null
  }, [cmsCollections, medusaCollections])

  if (!newestCollections) return null

  return (
    <div className="relative px-10 py-7">
      {/* Top accent */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-action-primary/50 to-transparent dark:via-wisled-500/50" />

      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-action-primary dark:bg-wisled-400" />
          <span className="text-[10.5px] font-black uppercase tracking-[0.22em] text-secondary dark:text-white/40">
            Nos collections
          </span>
        </div>
        <LocalizedClientLink
          href="/collections"
          className="group inline-flex items-center gap-1.5 rounded-full border border-basic-primary/10 px-4 py-1.5 text-xs font-bold text-basic-primary/60 transition-all duration-200 hover:border-action-primary/30 hover:bg-action-primary/5 hover:text-action-primary dark:border-white/10 dark:text-white/40 dark:hover:border-wisled-400/30 dark:hover:text-wisled-400"
        >
          Voir toutes
          <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </LocalizedClientLink>
      </div>

      {/* Collection tiles */}
      <div className="grid grid-cols-3 gap-5">
        {newestCollections.map((element) => (
          <CollectionTile
            key={element.handle}
            title={element.title}
            handle={element.handle}
            imgSrc={element.imgSrc}
            description={element.description}
          />
        ))}
      </div>

      {/* Bottom trust bar */}
      <div className="mt-6 flex items-center justify-center gap-8 border-t border-basic-primary/[0.07] pt-5 dark:border-white/[0.05]">
        {[
          { icon: '✨', label: 'Éclairage premium' },
          { icon: '🚚', label: 'Livraison au Maroc' },
          { icon: '🔧', label: 'Installation facile' },
        ].map((badge) => (
          <div key={badge.label} className="flex items-center gap-2">
            <span className="text-base">{badge.icon}</span>
            <span className="text-xs font-semibold text-secondary dark:text-white/40">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const CollectionTile = ({
  title,
  description,
  handle,
  imgSrc,
}: {
  title: string
  description: string
  handle: string
  imgSrc?: string
}) => {
  return (
    <LocalizedClientLink href={`/collections/${handle}`} className="group block">
      <Box className="relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:shadow-xl" style={{ height: '260px' }}>
        {/* Image */}
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={`${title} collection image`}
            fill
            sizes="(max-width: 1280px) 33vw, 400px"
            loading="lazy"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#0F1B33] via-[#16305c] to-[#1D4ED8]"
          />
        )}
        {/* Multi-stop gradient: richer overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Content */}
        <Box className="absolute inset-0 flex flex-col justify-between p-5">
          {/* Top: Discover badge */}
          <div className="flex justify-end">
            <span className="translate-y-[-4px] rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-black/90 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-black/60 dark:text-white">
              Découvrir →
            </span>
          </div>

          {/* Bottom: Title + description */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-black leading-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-y-[-2px]">
              {title}
            </h3>
            {description && (
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-white/75 transition-opacity duration-300">
                {description}
              </p>
            )}
          </div>
        </Box>

        {/* Border accent on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/0 transition-all duration-300 group-hover:border-white/20" />
      </Box>
    </LocalizedClientLink>
  )
}
