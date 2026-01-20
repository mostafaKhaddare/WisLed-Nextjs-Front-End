import { getWishlist } from '@lib/data/wishlist'
import { getRegion } from '@lib/data/regions'
import { Container, Text } from '@medusajs/ui'
import { redirect } from 'next/navigation'
import WishlistTemplate from './wishlist-template'

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function WishlistPage(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return (
      <Container className="py-12">
        <Text>Error loading region. Please try again later.</Text>
      </Container>
    )
  }

  let wishlistResult
  try {
    wishlistResult = await getWishlist()
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error calling getWishlist (outer catch):', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    return (
      <Container className="py-12">
        <Text className="text-negative">
          Error loading wishlist: {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </Text>
        {process.env.NODE_ENV === 'development' && (
          <Text className="mt-2 text-xs text-secondary">
            Check the server console for detailed error information.
          </Text>
        )}
      </Container>
    )
  }

  if (!wishlistResult) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getWishlist returned undefined or null')
    }
    return (
      <Container className="py-12">
        <Text className="text-negative">
          Error loading wishlist: No response from server
        </Text>
      </Container>
    )
  }

  const { items, error } = wishlistResult

  if (error) {
    // Handle error or redirect to login
    if (error === 'Not logged in' || error === 'Not authenticated') {
      redirect(`/${countryCode}/account/login?returnUrl=/${countryCode}/wishlist`)
    }
    
    // Log the actual error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Wishlist page error:', {
        error,
        errorType: typeof error,
        items: items?.length || 0,
      })
    }
    
    return (
      <Container className="py-12">
        <Text className="text-negative">
          {error.includes('Server configuration error')
            ? error
            : `Error loading wishlist: ${error}`}
        </Text>
        {error.includes('Server configuration error') && (
          <Text className="mt-4 text-sm text-secondary">
            Please check your environment variables and ensure the backend is running.
          </Text>
        )}
        {process.env.NODE_ENV === 'development' && (
          <Text className="mt-2 text-xs text-secondary">
            Check the server console for detailed error information.
          </Text>
        )}
      </Container>
    )
  }

  return <WishlistTemplate items={items || []} regionId={region.id} />
}