import { getWishlist } from '@lib/data/wishlist'
import { getRegion } from '@lib/data/regions'
import { getCustomer } from '@lib/data/customer'
import { Container, Text } from '@medusajs/ui'
import WishlistTemplate from './wishlist-template'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ countryCode: string }>
}

export const metadata: Metadata = {
  title: 'Ma liste de souhaits | WisLed',
  description:
    'Gérez votre liste de souhaits WisLed. Retrouvez vos produits LED préférés et ajoutez-les facilement à votre panier.',
  robots: {
    index: false,
    follow: true,
  },
}

export default async function WishlistPage(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return (
      <Container className="py-12">
        <Text>Erreur lors du chargement de la région. Veuillez réessayer.</Text>
      </Container>
    )
  }

  // Check if user is logged in
  let customer = null
  try {
    customer = await getCustomer()
  } catch {
    // Not authenticated
  }

  // If user is logged in, fetch server wishlist
  let serverItems: any[] = []
  let error: string | null = null

  if (customer?.id) {
    try {
      const wishlistResult = await getWishlist()
      if (wishlistResult) {
        serverItems = wishlistResult.items || []
        error = wishlistResult.error
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calling getWishlist:', err)
      }
      error =
        err instanceof Error ? err.message : 'An unexpected error occurred'
    }
  }

  // If there's an auth error, we'll show the guest wishlist (handled client-side)
  if (error === 'Not logged in' || error === 'Not authenticated') {
    error = null
  }

  if (error) {
    return (
      <Container className="py-12">
        <Text className="text-negative">
          Erreur lors du chargement: {error}
        </Text>
      </Container>
    )
  }

  return (
    <WishlistTemplate
      serverItems={serverItems}
      regionId={region.id}
      isAuthenticated={!!customer?.id}
      countryCode={countryCode}
    />
  )
}