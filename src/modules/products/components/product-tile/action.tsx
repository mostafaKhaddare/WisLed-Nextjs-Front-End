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

export function ProductActions({
  productHandle,
  regionId,
  variantId: initialVariantId,
  title,
  thumbnail,
  productId,
}: {
  productHandle: string
  regionId: string
  variantId?: string
  title?: string
  thumbnail?: string
  productId?: string
}) {
  const params = useParams()
  const countryCode = params?.countryCode as string
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

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
    <>
      <Box className="absolute right-3 top-3 z-10 flex flex-col gap-2.5 small:right-4 small:top-4">
        {/* Wishlist Button */}
        <Button
          variant="icon"
          onClick={handleWishlist}
          disabled={isLoadingWishlist}
          withIcon
          className={cn(
            '!rounded-lg !p-2.5 !h-auto !w-auto',
            'backdrop-blur-sm shadow-md transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
            isLoadingWishlist && 'opacity-60 cursor-not-allowed',
            wishlisted
              ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60'
              : 'bg-primary/90 hover:bg-fg-primary hover:shadow-lg dark:bg-white/10 dark:hover:bg-white/20'
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
                  : 'text-basic-primary/70 hover:text-red-400 scale-100'
              )}
              filled={wishlisted}
            />
          )}
        </Button>
      </Box>

      <Box className="absolute right-3 bottom-3 z-10 flex flex-col gap-2.5 small:right-4 small:bottom-4">
        {/* Add to Cart Button */}
        <Button
          variant="icon"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          withIcon
          className={cn(
            '!rounded-full !p-2.5 !h-auto !w-auto',
            'bg-primary/90 backdrop-blur-sm shadow-md',
            'hover:bg-fg-primary hover:shadow-lg',
            'active:bg-fg-primary-pressed',
            'dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/15',
            'transition-all duration-200',
            isAddingToCart && 'opacity-60 cursor-not-allowed'
          )}
          aria-label="Ajouter au panier"
        >
          {isAddingToCart ? (
            <Spinner className="h-6 w-6 text-action-primary dark:text-white" />
          ) : (
            <BagIcon className="h-6 w-6 text-action-primary dark:text-white" />
          )}
        </Button>
      </Box>
    </>
  )
}
