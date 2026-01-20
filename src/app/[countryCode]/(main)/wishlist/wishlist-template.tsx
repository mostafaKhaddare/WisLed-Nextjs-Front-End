'use client'

import { removeFromWishlist, type WishlistItem } from '@lib/data/wishlist'
import { useRouter } from 'next/navigation'
import { toast } from '@modules/common/components/toast'
import { ProductTile } from '@modules/products/components/product-tile'
import { Container } from '@modules/common/components/container'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { HeartIcon } from '@modules/common/icons'

type WishlistTemplateProps = {
  items: WishlistItem[]
  regionId: string
}

export default function WishlistTemplate({
  items,
  regionId,
}: WishlistTemplateProps) {
  const router = useRouter()

  const handleRemove = async (itemId: string) => {
    try {
      const { success, error } = await removeFromWishlist(itemId)

      if (success) {
        router.refresh()
        toast('success', 'Removed from wishlist')
      } else {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error instanceof Error
            ? error.message
            : 'Failed to remove item'

        toast('error', errorMessage)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      toast('error', errorMessage)
    }
  }

  if (!items || items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center py-16 text-center">
        <Box className="mb-6">
          <HeartIcon className="h-16 w-16 text-secondary" filled={false} />
        </Box>
        <Heading level="h1" className="mb-4 text-2xl">
          Your Wishlist is Empty
        </Heading>
        <Text className="mb-8 text-secondary">
          You haven&apos;t added any items to your wishlist yet. Start exploring
          our products and add your favorites!
        </Text>
        <Button asChild>
          <LocalizedClientLink href="/shop">Continue Shopping</LocalizedClientLink>
        </Button>
      </Container>
    )
  }

  // Transform wishlist items to product format for ProductTile
  const transformedItems = items
    .map((item) => {
      const variant = item.product_variant
      const product = variant?.product

      if (!product) return null

      // Price will be fetched separately or shown as "Price unavailable"
      // The backend doesn't include calculated_price in wishlist items
      // We'll show a placeholder or fetch it when needed
      const calculatedPrice = ''

      return {
        id: product.id,
        created_at: product.created_at || new Date().toISOString(),
        title: product.title || '',
        handle: product.handle || '',
        thumbnail: product.thumbnail || '',
        calculatedPrice,
        salePrice: '', // TODO: Calculate sale price if needed
        wishlistItemId: item.id,
      }
    })
    .filter(Boolean) as Array<{
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string
    calculatedPrice: string
    salePrice: string
    wishlistItemId: string
  }>

  return (
    <Container className="flex flex-col gap-8 !py-8 small:gap-12">
      <Box className="flex flex-col gap-2">
        <Heading level="h1" className="text-2xl small:text-3xl">
          Your Wishlist
        </Heading>
        <Text className="text-secondary">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </Box>

      <ul className="grid w-full grid-cols-2 gap-x-2 gap-y-6 small:grid-cols-2 large:grid-cols-4">
        {transformedItems.map((product) => (
          <li key={product.id} className="relative group">
            <ProductTile product={product} regionId={regionId} />
            <Button
              variant="icon"
              onClick={() => handleRemove(product.wishlistItemId)}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:shadow-lg"
              aria-label="Remove from wishlist"
            >
              <HeartIcon className="h-5 w-5 text-red-500 fill-red-500" filled />
            </Button>
          </li>
        ))}
      </ul>
    </Container>
  )
}