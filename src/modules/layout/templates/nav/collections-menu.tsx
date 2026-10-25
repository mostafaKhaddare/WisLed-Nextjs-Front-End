'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { buildCollectionCards } from '@lib/util/collection-image'
import { StoreCollection } from '@medusajs/types'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { CollectionsData } from 'types/strapi'

import MegaMenuTrustBar from './mega-menu-trust-bar'

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

  if (!newestCollections) {
    return (
      <div className="flex flex-col" style={{ maxHeight: 'min(600px, 78vh)' }}>
        <div className="px-6 py-8 xl:px-8">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary dark:text-white/40">
            Collections
          </span>
          <h3 className="mt-1.5 font-sora text-xl font-bold tracking-tight text-basic-primary dark:text-white">
            Nos collections
          </h3>
          <p className="mt-2 max-w-md text-[12px] leading-relaxed text-secondary dark:text-white/45">
            Nos sélections sont en cours de préparation. En attendant, retrouvez
            tous nos produits dans la boutique.
          </p>
          <LocalizedClientLink
            href="/shop"
            className="bg-action-primary hover:bg-action-primary-hover group mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-wisled-600 dark:hover:bg-wisled-500"
          >
            Voir la boutique
            <svg
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </LocalizedClientLink>
        </div>
        <MegaMenuTrustBar />
      </div>
    )
  }

  const collectionCountLabel =
    newestCollections.length === 1
      ? '1 collection'
      : `${newestCollections.length} collections`

  return (
    <div className="flex flex-col" style={{ maxHeight: 'min(600px, 78vh)' }}>
      {/* Section header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-basic-primary/[0.07] px-6 py-4 dark:border-white/[0.05] xl:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-action-primary/[0.08] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-action-primary dark:bg-wisled-400/10 dark:text-wisled-400">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.5h6.5v6.5h-6.5zM13.75 4.5h6.5v6.5h-6.5zM3.75 13.5h6.5v6.5h-6.5zM13.75 13.5h6.5v6.5h-6.5z"
              />
            </svg>
          </span>
          <div>
            <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-secondary dark:text-white/35">
              Explorer
            </span>
            <h3 className="font-sora text-[17px] font-bold leading-tight tracking-tight text-basic-primary dark:text-white">
              Nos collections
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary dark:text-white/35 xl:block">
            {collectionCountLabel}
          </span>
          <LocalizedClientLink
            href="/collections"
            className="hover:bg-action-primary/[0.04] group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-basic-primary/10 px-3.5 py-2 text-[11px] font-semibold text-basic-primary/70 transition-all duration-200 hover:border-action-primary/30 hover:text-action-primary dark:border-white/10 dark:text-white/55 dark:hover:border-wisled-400/30 dark:hover:bg-wisled-400/[0.06] dark:hover:text-wisled-400"
          >
            Voir toutes
            <svg
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Collection tiles */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 xl:px-8 xl:py-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 xl:gap-5">
          {newestCollections.map((collection) => (
            <CollectionTile
              key={collection.handle}
              title={collection.title}
              handle={collection.handle}
              imgSrc={collection.imgSrc}
              description={collection.description}
            />
          ))}
        </div>
      </div>

      <MegaMenuTrustBar />
    </div>
  )
}

function CollectionTile({
  title,
  description,
  handle,
  imgSrc,
}: {
  title: string
  description: string
  handle: string
  imgSrc?: string
}) {
  const initial = title.charAt(0).toUpperCase()

  return (
    <LocalizedClientLink
      href={`/collections/${handle}`}
      className="focus-visible:ring-action-primary/30 group relative block h-[248px] overflow-hidden rounded-2xl border border-basic-primary/[0.06] bg-wisled-950 shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 dark:border-white/[0.06] xl:h-[264px]"
      data-testid={`collection-${handle}`}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={`Collection ${title}`}
          fill
          sizes="(max-width: 1280px) 30vw, 380px"
          loading="lazy"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-wisled-950 via-wisled-900 to-wisled-600"
          />
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="text-8xl absolute inset-0 flex items-center justify-center font-sora font-black leading-none text-white/[0.08]"
          >
            {initial}
          </span>
        </>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 ring-1 ring-inset ring-white/20 transition-opacity duration-300 group-hover:opacity-100"
      />

      <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </span>

      <span className="absolute inset-x-0 bottom-0 block p-5">
        <span className="mb-2 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/55">
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-white/60"
          />
          Collection
        </span>
        <span className="line-clamp-2 block font-sora text-lg font-bold leading-tight text-white">
          {title}
        </span>
        {description ? (
          <span className="mt-1.5 line-clamp-2 block text-[11.5px] leading-relaxed text-white/70">
            {description}
          </span>
        ) : null}
      </span>
    </LocalizedClientLink>
  )
}
