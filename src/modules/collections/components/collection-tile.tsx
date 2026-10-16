import Image from 'next/image'

import { type CollectionCard } from '@lib/util/collection-image'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

/**
 * Collection tile for the collections index ("Nos collections").
 *
 * Reuses the homepage / mega-menu tile language so the listing feels like the
 * rest of the storefront: a rounded image panel under a legibility gradient, a
 * Sora title, a clamped description and a "Découvrir" pill that fades in on
 * hover. When neither Medusa nor the CMS has artwork the tile falls back to the
 * branded navy→blue wash instead of a broken <img>.
 */
export function CollectionTile({ card }: { card: CollectionCard }) {
  const { title, handle, imgSrc, description } = card

  return (
    <LocalizedClientLink
      href={`/collections/${encodeURIComponent(handle)}`}
      className="group block"
    >
      <Box className="relative h-[180px] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/[0.04] transition-all duration-300 group-hover:shadow-xl group-hover:ring-wisled-500/30 small:h-[260px] dark:ring-white/[0.06]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={`${title} collection image`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 33vw"
            loading="lazy"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          // No image on either source yet — a branded wash keeps the tile
          // readable instead of rendering a broken <img>.
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#0F1B33] via-[#16305c] to-[#1D4ED8]"
          />
        )}

        {/* Legibility wash — always on, never darkened on hover. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <Box className="absolute inset-0 flex flex-col justify-between p-5 small:p-6">
          <div className="flex justify-end">
            <span className="translate-y-[-4px] rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-black/90 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-black/60 dark:text-white">
              Découvrir →
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-sora text-lg font-bold leading-tight text-white drop-shadow-md small:text-xl">
              {title}
            </h2>
            {description && (
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-white/75">
                {description}
              </p>
            )}
          </div>
        </Box>
      </Box>
    </LocalizedClientLink>
  )
}
