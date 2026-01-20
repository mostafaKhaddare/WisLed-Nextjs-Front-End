'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
  getVariantIdByProductHandle,
} from '@lib/data/wishlist'
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
}: {
  productHandle: string
  regionId: string
}) {
  const params = useParams()
  const countryCode = params?.countryCode as string
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | undefined>()
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [variantId, setVariantId] = useState<string | null>(null)

  // Check if product is in wishlist on component mount (non-blocking)
  useEffect(() => {
    let isMounted = true
    
    const checkWishlist = async () => {
      try {
        // Don't show loading spinner for initial check - show icon immediately
        const { inWishlist, itemId } = await isInWishlist(productHandle)
        if (isMounted) {
          setIsWishlisted(inWishlist)
          setWishlistItemId(itemId)
        }
      } catch (error) {
        console.error('Error checking wishlist:', error)
        // Don't update state if component unmounted
      }
    }

    // Run check in background without blocking UI
    checkWishlist()

    return () => {
      isMounted = false
    }
  }, [productHandle])

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Get or fetch variant ID
    let currentVariantId = variantId
    
    // If variant ID is not loaded yet, try to fetch it first
    if (!currentVariantId) {
      try {
        setIsLoadingWishlist(true)
        const { variantId: id, error } = await getVariantIdByProductHandle(
          productHandle,
          regionId
        )
        if (error || !id) {
          toast('error', 'Product variant not available. Please try again.')
          setIsLoadingWishlist(false)
          return
        }
        // Update state for future use
        setVariantId(id)
        // Use the fetched ID directly (state update is async)
        currentVariantId = id
      } catch (error) {
        console.error('Error fetching variant ID:', error)
        toast('error', 'Failed to load product details. Please try again.')
        setIsLoadingWishlist(false)
        return
      }
    }

    if (!currentVariantId) {
      toast('error', 'Product variant not available. Please try again.')
      setIsLoadingWishlist(false)
      return
    }

    try {
      setIsLoadingWishlist(true)

      if (isWishlisted && wishlistItemId) {
        // Remove from wishlist
        const result = await removeFromWishlist(wishlistItemId)
        if (result.success) {
          setIsWishlisted(false)
          setWishlistItemId(undefined)
          toast('success', 'Removed from wishlist')
        } else {
          const errorMsg =
            typeof result.error === 'string'
              ? result.error
              : 'Failed to remove from wishlist'
          toast('error', errorMsg)
          console.error('removeFromWishlist error:', result.error)
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(currentVariantId)
        if (result.success) {
          setIsWishlisted(true)
          // Refresh wishlist status to get item ID
          try {
            const wishlistStatus = await isInWishlist(productHandle)
            setIsWishlisted(wishlistStatus.inWishlist)
            setWishlistItemId(wishlistStatus.itemId || undefined)
          } catch (error) {
            console.error('Error refreshing wishlist status:', error)
            // Still show success even if refresh fails
          }
          toast('success', 'Added to wishlist')
        } else {
          const errorMsg =
            typeof result.error === 'string'
              ? result.error
              : 'Failed to add to wishlist'
          toast('error', errorMsg)
          console.error('addToWishlist error:', result.error)
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'An error occurred. Please try again.'
      toast('error', errorMessage)
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
        toast('success', 'Product added to cart!')
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to add product to cart'
        toast('error', errorMsg)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'An error occurred. Please try again.'
      toast('error', errorMessage)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
     <>
      <Box className="absolute right-3 top-3 z-10 flex flex-col gap-2.5 small:right-4 small:top-4">
      {/* Wishlist Button - Square style with Solace theme */}
          <Button
        variant="icon"
        onClick={handleWishlist}
        disabled={isLoadingWishlist}
        withIcon
        className={cn(
          '!rounded-lg !p-2.5 !h-auto !w-auto',
          'bg-primary/90 backdrop-blur-sm shadow-md',
          'hover:bg-fg-primary hover:shadow-lg',
          'active:bg-content-action-primary-pressed',  
          isLoadingWishlist && 'opacity-60 cursor-not-allowed',
          isWishlisted && 'bg-fg-secondary hover:bg-fg-secondary-hover'
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isLoadingWishlist ? (
          <Spinner className="h-4 w-4 text-action-primary" />
        ) : (
          <HeartIcon
            className={cn(
              'h-4 w-4 ',
              isWishlisted
                ? 'text-fg-primary-negative fill-fg-primary-negative'
                : 'text-action-primary'
            )}
            filled={isWishlisted}
          />
        )}
         </Button>
    </Box>
    
       <Box className="absolute right-3 bottom-3 z-10 flex flex-col gap-2.5 small:right-4 small:bottom-4">
                  {/* Wishlist Button - Square style with Solace theme */}
              <Button
       variant="icon"
       onClick={handleAddToCart}
       disabled={isAddingToCart}
       withIcon
       className={cn(
         '!rounded-full !p-2.5 !h-auto !w-auto',
         'bg-primary/90 backdrop-blur-sm shadow-md',
         'hover:hover:bg-fg-primary hover:shadow-lg',
         'active:bg-fg-primary-pressed',
         

         isAddingToCart && 'opacity-60 cursor-not-allowed'
       )}
       aria-label="Add to cart"
     >
       {isAddingToCart ? (
         <Spinner className="h-6 w-6 text-action-primary" />
       ) : (
         <BagIcon className="h-6 w-6 text-action-primary " />
       )}
            </Button>
      </Box>
     </>
  )
}