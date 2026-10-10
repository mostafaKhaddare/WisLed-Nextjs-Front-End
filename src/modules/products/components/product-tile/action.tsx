'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useWishlist } from '@lib/context/wishlist-context'
import { addToCartCheapestVariant } from '@lib/data/cart'
import { toast } from '@modules/common/components/toast'
import { HeartIcon, BagIcon, PlusIcon } from '@modules/common/icons'
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
  /** Overrides the default in-card placement (used by the detail-page hero). */
  className?: string
}

export function WishlistButton({
  productHandle,
  regionId,
  variantId: initialVariantId,
  title,
  thumbnail,
  productId,
  className,
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
    <Box
      className={cn(
        'absolute right-2.5 top-2.5 z-10 small:right-3.5 small:top-3.5',
        className
      )}
    >
      <Button
        variant="icon"
        onClick={handleWishlist}
        disabled={isLoadingWishlist}
        withIcon
        className={cn(
          // Matches the mock: a plain white disc that reads on any photo.
          '!grid !h-8 !w-8 !place-items-center !rounded-full !p-0',
          'bg-white shadow-[0_2px_8px_rgba(13,27,54,0.15)]',
          'transition-transform duration-200 hover:scale-105 active:scale-95',
          'small:!h-9 small:!w-9',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2',
          isLoadingWishlist && 'opacity-60 cursor-not-allowed'
        )}
        aria-label={
          wishlisted
            ? 'Retirer de la liste de souhaits'
            : 'Ajouter à la liste de souhaits'
        }
      >
        {isLoadingWishlist ? (
          <Spinner className="h-4 w-4 text-[#E5484D]" />
        ) : (
          <HeartIcon
            className={cn(
              'h-4 w-4 transition-all duration-300 small:h-[18px] small:w-[18px]',
              wishlisted
                ? 'text-[#E5484D] fill-[#E5484D] scale-110'
                : 'text-[#0F1B33] hover:text-[#E5484D] scale-100'
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
      onClick={handleAddToCart}
      disabled={isAddingToCart}
      className={cn(
        // One control, two shapes: a compact 44px disc on touch, the full
        // "Ajouter" pill from the mock once there is room for the label.
        // `flex`, not `grid`: a grid stacks its children into rows, which would
        // drop the label underneath the icon instead of beside it.
        'shrink-0 !rounded-full !p-0',
        '!flex !h-11 !w-11 !items-center !justify-center',
        'small:!h-11 small:!w-auto small:!gap-2 small:!px-5',
        'bg-[#1D4ED8] text-white',
        'shadow-[0_6px_16px_rgba(29,78,216,0.28)]',
        'hover:bg-[#1B45C4] hover:shadow-[0_8px_20px_rgba(29,78,216,0.36)]',
        'active:bg-[#183CA9]',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2',
        isAddingToCart && 'opacity-60 cursor-not-allowed'
      )}
      aria-label="Ajouter au panier"
    >
      {isAddingToCart ? (
        <Spinner className="h-5 w-5 text-white" />
      ) : (
        // Icon first so it sits on the left, label on the right.
        <>
          <PlusIcon className="h-5 w-5 small:hidden" />
          <BagIcon className="hidden h-4 w-4 small:block" />
          <span className="hidden font-jakarta text-sm font-bold leading-none small:inline">
            Ajouter
          </span>
        </>
      )}
    </Button>
  )
}