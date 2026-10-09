'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useWishlist } from '@lib/context/wishlist-context'
import { addToCartCheapestVariant } from '@lib/data/cart'
import { toast } from '@modules/common/components/toast'
import { HeartIcon, BagIcon } from '@modules/common/icons'
import { Spinner } from '@modules/common/icons'
import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'

interface ActionProps {
  productHandle: string
  regionId: string
  variantId?: string
  title?: string
  thumbnail?: string
  productId?: string
}

export function WishlistButton({
  productHandle,
  regionId,
  variantId: initialVariantId,
  title,
  thumbnail,
  productId,
}: ActionProps) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const wishlisted = isWishlisted(productHandle)

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsLoadingWishlist(true)

      const result = await toggleWishlist({
        productHandle,
        variantId: initialVariantId,
        regionId,
        title,
        thumbnail,
        productId,
      })

      if (result.success) {
        toast(
          'success',
          wishlisted
            ? 'Retiré de la liste de souhaits'
            : 'Ajouté à la liste de souhaits'
        )
      } else {
        toast('error', result.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast('error', 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoadingWishlist(false)
    }
  }

  return (
    <Box className="absolute right-2 top-2 z-10 small:right-3 small:top-3">
      <Button
        variant="icon"
        onClick={handleWishlist}
        disabled={isLoadingWishlist}
        withIcon
        className={cn(
          '!rounded-full !p-2 !h-auto !w-auto',
          'backdrop-blur-sm shadow-md transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wisled-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
          isLoadingWishlist && 'opacity-60 cursor-not-allowed',
          wishlisted
            ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60'
            : 'bg-primary/90 hover:bg-wisled-50 hover:shadow-lg dark:bg-white/10 dark:hover:bg-white/20'
        )}
        aria-label={
          wishlisted
            ? 'Retirer de la liste de souhaits'
            : 'Ajouter à la liste de souhaits'
        }
      >
        {isLoadingWishlist ? (
          <Spinner className="h-4 w-4 text-red-500" />
        ) : (
          <HeartIcon
            className={cn(
              'h-4 w-4 transition-all duration-300',
              wishlisted
                ? 'text-red-500 fill-red-500 scale-110'
                : 'text-wisled-600 hover:text-red-400 dark:text-wisled-300 dark:hover:text-red-400 scale-100'
            )}
            filled={wishlisted}
          />
        )}
      </Button>
    </Box>
  )
}

export function AddToCartButton({
  productHandle,
  regionId,
}: {
  productHandle: string
  regionId: string
}) {
  const params = useParams()
  const countryCode = params?.countryCode as string
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!countryCode) {
      toast('error', 'Country code is required')
      return
    }

    try {
      setIsAddingToCart(true)
      const result = await addToCartCheapestVariant({
        productHandle,
        regionId,
        countryCode,
      })

      if (result.success) {
        toast('success', 'Produit ajouté au panier !')
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : "Échec de l'ajout au panier"
        toast('error', errorMsg)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast('error', 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Button
      variant="filled"
      size="sm"
      onClick={handleAddToCart}
      disabled={isAddingToCart}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 gap-1.5',
        'bg-wisled-500 text-white',
        'hover:bg-wisled-600 active:bg-wisled-700',
        'shadow-md shadow-wisled-500/25',
        'hover:shadow-lg hover:shadow-wisled-500/40',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wisled-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
        isAddingToCart && 'opacity-60 cursor-not-allowed'
      )}
      aria-label="Ajouter au panier"
    >
      {isAddingToCart ? (
        <Spinner className="h-4 w-4 text-white" />
      ) : (
        <>
          <BagIcon className="h-4 w-4" />
          <span className="font-medium text-sm">Ajouter</span>
        </>
      )}
    </Button>
  )
}