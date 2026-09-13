'use client'

import { useState } from 'react'

import { useWishlist } from '@lib/context/wishlist-context'
import { addToCartCheapestVariant } from '@lib/data/cart'
import type { WishlistItem } from '@lib/data/wishlist'
import { cn } from '@lib/util/cn'
import { toast } from '@modules/common/components/toast'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { HeartIcon, BagIcon, Spinner } from '@modules/common/icons'

type WishlistTemplateProps = {
  serverItems: WishlistItem[]
  regionId: string
  isAuthenticated: boolean
  countryCode: string
}

/* Thumbnail helper — handles null, empty, relative URLs */
function getThumbnailUrl(thumbnail?: string | null): string | null {
  if (!thumbnail) return null

  let url = thumbnail
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

  // If it's a relative URL, prepend Medusa backend URL
  if (url.startsWith('/')) {
    url = `${backendUrl}${url}`
  }

  // 🚨 MOBILE PREVIEW FIX:
  // If running on a network (e.g. 192.168.x.x) but API is localhost,
  // replace localhost with the actual device hostname so images load.
  if (typeof window !== 'undefined') {
    if (url.includes('localhost')) {
      url = url.replace('localhost', window.location.hostname)
    }
    if (url.includes('127.0.0.1')) {
      url = url.replace('127.0.0.1', window.location.hostname)
    }
  }

  return url
}

export default function WishlistTemplate({
  regionId,
  isAuthenticated: _initialAuth,
  countryCode,
}: WishlistTemplateProps) {
  const { items, count, removeItem, isAuthenticated } = useWishlist()
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [cartLoadingIds, setCartLoadingIds] = useState<Set<string>>(new Set())
  const [shareLoading, setShareLoading] = useState(false)

  const handleRemove = async (itemId: string) => {
    setRemovingIds((prev) => new Set(prev).add(itemId))

    const { success, error } = await removeItem(itemId)

    if (success) {
      toast('success', 'Retiré de la liste de souhaits')
    } else {
      toast('error', error || 'Échec de la suppression')
    }

    setRemovingIds((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleMoveToCart = async (item: WishlistItem) => {
    const handle = item.product_variant?.product?.handle
    if (!handle) {
      toast('error', 'Produit non disponible')
      return
    }

    setCartLoadingIds((prev) => new Set(prev).add(item.id))

    try {
      const result = await addToCartCheapestVariant({
        productHandle: handle,
        regionId,
        countryCode,
      })

      if (result.success) {
        await removeItem(item.id)
        toast('success', 'Déplacé vers le panier !')
      } else {
        toast(
          'error',
          typeof result.error === 'string'
            ? result.error
            : "Échec de l'ajout au panier"
        )
      }
    } catch {
      toast('error', 'Une erreur est survenue')
    } finally {
      setCartLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast(
        'error',
        'Connectez-vous pour partager votre liste de souhaits'
      )
      return
    }

    setShareLoading(true)

    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast('success', 'Lien copié dans le presse-papiers !')
    } catch {
      toast('error', 'Impossible de copier le lien')
    } finally {
      setShareLoading(false)
    }
  }

  /* ── Empty State ── */
  if (count === 0) {
    return (
      <Container className="flex flex-col items-center justify-center py-20 text-center">
        {/* Animated heart */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
            <HeartIcon
              className="h-12 w-12 text-red-300 dark:text-red-800"
              filled={false}
            />
          </div>
          {/* Decorative dots */}
          <div className="absolute -right-2 -top-2 h-3 w-3 animate-pulse rounded-full bg-red-300" />
          <div className="absolute -bottom-1 -left-3 h-2 w-2 animate-pulse rounded-full bg-red-400" style={{ animationDelay: '0.3s' }} />
        </div>

        <Heading as="h1" className="mb-3 text-2xl font-bold small:text-3xl">
          Votre liste de souhaits est vide
        </Heading>

        <Text className="mb-2 max-w-md text-secondary">
          {isAuthenticated
            ? "Vous n'avez pas encore ajouté de produits à votre liste. Parcourez notre boutique pour trouver vos favoris !"
            : "Ajoutez vos produits préférés à votre liste de souhaits. Connectez-vous pour les sauvegarder sur tous vos appareils."}
        </Text>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="min-w-[200px]">
            <LocalizedClientLink href="/shop">
              Découvrir la boutique
            </LocalizedClientLink>
          </Button>

          {!isAuthenticated && (
            <Button variant="tonal" asChild className="min-w-[200px]">
              <LocalizedClientLink href="/account/login">
                Se connecter
              </LocalizedClientLink>
            </Button>
          )}
        </div>
      </Container>
    )
  }

  /* ── Wishlist Grid ── */
  return (
    <Container className="flex flex-col gap-8 !py-8 small:gap-10">
      {/* Header */}
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading as="h1" className="text-2xl font-bold small:text-3xl">
            Ma liste de souhaits
          </Heading>
          <Text className="mt-1 text-secondary">
            {count} {count === 1 ? 'produit' : 'produits'}
            {!isAuthenticated && (
              <span className="ml-2 text-xs text-red-500">
                • Sauvegardé localement
              </span>
            )}
          </Text>
        </div>

        <div className="flex gap-2">
          {/* Share button */}
          <Button
            variant="tonal"
            size="sm"
            onClick={handleShare}
            disabled={shareLoading}
            className="gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            Partager
          </Button>
        </div>
      </Box>

      {/* Guest info banner */}
      {!isAuthenticated && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/30 dark:bg-red-900/10">
          <svg
            className="h-5 w-5 shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <Text size="sm" className="text-red-700 dark:text-red-300">
            Votre liste est sauvegardée sur cet appareil.{' '}
            <LocalizedClientLink
              href="/account/login"
              className="font-semibold underline"
            >
              Connectez-vous
            </LocalizedClientLink>{' '}
            pour la synchroniser partout.
          </Text>
        </div>
      )}

      {/* Product grid */}
      <ul className="grid w-full grid-cols-1 gap-4 xsmall:grid-cols-2 small:gap-6 large:grid-cols-3 xlarge:grid-cols-4">
        {items.map((item) => {
          const product = item.product_variant?.product
          if (!product) return null

          const isRemoving = removingIds.has(item.id)
          const isMovingToCart = cartLoadingIds.has(item.id)
          const thumbUrl = getThumbnailUrl(product.thumbnail)

          return (
            <li
              key={item.id}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-basic-primary/10 bg-primary transition-all duration-300',
                'hover:border-basic-primary/20 hover:shadow-lg',
                isRemoving && 'scale-95 opacity-50'
              )}
            >
              {/* Product Image — using <img> for maximum URL compatibility */}
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="relative aspect-square overflow-hidden bg-secondary/30"
              >
                {thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt={product.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary/20">
                    <BagIcon className="h-12 w-12 text-secondary" />
                  </div>
                )}

                {/* Remove button overlay — red filled heart */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemove(item.id)
                  }}
                  disabled={isRemoving}
                  className={cn(
                    'absolute right-3 top-3 rounded-full p-2 shadow-md backdrop-blur-sm transition-all duration-200',
                    'bg-white/90 hover:bg-white hover:shadow-lg',
                    'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
                    'dark:bg-black/60 dark:hover:bg-black/80'
                  )}
                  aria-label="Retirer de la liste"
                >
                  <HeartIcon
                    className="h-5 w-5 text-red-500 fill-red-500"
                    filled
                  />
                </button>
              </LocalizedClientLink>

              {/* Product Info */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="text-sm font-semibold text-basic-primary transition-colors hover:text-action-primary line-clamp-2"
                >
                  {product.title}
                </LocalizedClientLink>

                {/* Move to Cart */}
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => handleMoveToCart(item)}
                  disabled={isMovingToCart}
                  className="mt-auto w-full gap-2"
                >
                  {isMovingToCart ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <BagIcon className="h-4 w-4" />
                  )}
                  Ajouter au panier
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}