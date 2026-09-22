'use server'

import { getMedusaBackendUrl } from '@lib/medusa-env'

import { getCustomer } from './customer'
import { getAuthHeaders } from './cookies'

// Get environment variables directly (server-side only)
const BACKEND_URL = getMedusaBackendUrl(process.env)
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export interface WishlistItem {
  id: string
  product_variant_id: string
  product_variant?: {
    id: string
    product_id: string
    product?: {
      id: string
      title: string
      handle: string
      thumbnail: string
      calculatedPrice?: string
      salePrice?: string
    }
  }
}

interface Wishlist {
  id: string
  customer_id: string
  sales_channel_id: string
  title?: string | null
  items?: WishlistItem[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string | unknown
}

interface WishlistResponse {
  wishlist: Wishlist | null
  items: WishlistItem[]
}

// Helper function to get customer ID
async function getCustomerId(): Promise<string | null> {
  const customer = await getCustomer()
  return customer?.id || null
}

// Get first variant ID for a product handle (server action)
export async function getVariantIdByProductHandle(
  productHandle: string,
  regionId: string
): Promise<{ variantId: string | null; error: string | null }> {
  if (!BACKEND_URL || !PUBLISHABLE_API_KEY) {
    return {
      variantId: null,
      error: 'Server configuration error: Missing API keys',
    }
  }

  try {
    // Use fetch instead of SDK for server actions
    const response = await fetch(
      `${BACKEND_URL}/store/products?handle=${encodeURIComponent(productHandle)}&region_id=${regionId}&fields=variants.id`,
      {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return {
        variantId: null,
        error: `Failed to fetch product: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const products = data.products || []

    if (!products || products.length === 0) {
      return { variantId: null, error: 'Product not found' }
    }

    const product = products[0]
    if (!product.variants || product.variants.length === 0) {
      return { variantId: null, error: 'Product has no variants' }
    }

    return { variantId: product.variants[0].id, error: null }
  } catch (error) {
    console.error('Error getting variant ID:', error)
    return {
      variantId: null,
      error: error instanceof Error ? error.message : 'Failed to get variant ID',
    }
  }
}

// Note: All functions in this file are server actions ('use server')
// They can access httpOnly cookies via getAuthHeaders()

// Get the current customer's wishlist
export async function getWishlist(): Promise<{
  wishlist: Wishlist | null
  items: WishlistItem[]
  error: string | null
}> {
  // Wrap everything in a try-catch to ensure no unhandled errors
  try {
    let customer
    try {
      customer = await getCustomer()
    } catch (customerError) {
      console.error('Error getting customer in getWishlist:', customerError)
      return {
        wishlist: null,
        items: [],
        error: 'Failed to retrieve customer information',
      }
    }

    if (!customer?.id) {
      return { wishlist: null, items: [], error: 'Not logged in' }
    }

    let authHeaders
    try {
      authHeaders = await getAuthHeaders()
    } catch (authError) {
      console.error('Error getting auth headers in getWishlist:', authError)
      return {
        wishlist: null,
        items: [],
        error: 'Failed to retrieve authentication information',
      }
    }
    
    if (!PUBLISHABLE_API_KEY) {
      console.error('PUBLISHABLE_API_KEY is not set')
      return {
        wishlist: null,
        items: [],
        error: 'Server configuration error: Publishable API key is missing',
      }
    }

    if (!authHeaders.authorization) {
      console.error('No authorization header found')
      return {
        wishlist: null,
        items: [],
        error: 'Not authenticated',
      }
    }

    if (!BACKEND_URL) {
      console.error('BACKEND_URL is not set')
      return {
        wishlist: null,
        items: [],
        error: 'Server configuration error: Backend URL is missing',
      }
    }

    let response: Response
    try {
      response = await fetch(`${BACKEND_URL}/store/wishlist`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
          Authorization: authHeaders.authorization,
        },
        credentials: 'include',
        cache: 'no-store',
      })
    } catch (fetchError) {
      // Network error or fetch failed
      const networkError =
        fetchError instanceof Error
          ? fetchError.message
          : 'Network error: Unable to connect to the backend server'
      
      console.error('Fetch error in getWishlist:', {
        fetchError,
        url: `${BACKEND_URL}/store/wishlist`,
        message: networkError,
      })
      
      return {
        wishlist: null,
        items: [],
        error: `Unable to connect to backend server. Please ensure the Medusa backend is running at ${BACKEND_URL}`,
      }
    }

    if (!response.ok) {
      let errorMessage = `Failed to fetch wishlist: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text()
          if (errorText) errorMessage = errorText
        } catch {
          // Use default error message
        }
      }

      console.error('Wishlist API Error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        url: `${BACKEND_URL}/store/wishlist`,
      })

      if (response.status === 401) {
        return { wishlist: null, items: [], error: 'Not authenticated' }
      }

      return {
        wishlist: null,
        items: [],
        error: errorMessage,
      }
    }

    let data: WishlistResponse
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Error parsing wishlist response JSON:', jsonError)
      return {
        wishlist: null,
        items: [],
        error: 'Invalid response from server. Please try again later.',
      }
    }

    return {
      wishlist: data.wishlist,
      items: data.items || [],
      error: null,
    }
  } catch (error) {
    let errorMessage = 'Failed to fetch wishlist'
    
    try {
      if (error instanceof Error) {
        errorMessage = error.message || error.name || error.toString()
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Try to extract message from error object
        const err = error as any
        errorMessage =
          err.message ||
          err.error ||
          err.reason ||
          err.toString() ||
          JSON.stringify(error, Object.getOwnPropertyNames(error))
      } else if (error === null || error === undefined) {
        errorMessage = 'An unexpected null or undefined error occurred'
      } else {
        errorMessage = String(error) || 'An unknown error occurred'
      }
    } catch (parseError) {
      // If we can't parse the error, use a default message
      errorMessage = 'An unexpected error occurred while fetching wishlist'
      console.error('Error parsing error object:', parseError)
    }
    
    // Enhanced logging - use console.error with multiple arguments for better visibility
    console.error('=== getWishlist ERROR START ===')
    console.error('Error object:', error)
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    console.error('Error message:', errorMessage)
    console.error('Error string:', String(error))
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
    }
    if (error && typeof error === 'object') {
      try {
        console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (jsonErr) {
        console.error('Could not stringify error:', jsonErr)
      }
    }
    console.error('=== getWishlist ERROR END ===')
    
    // Ensure we always return a string error message
    const finalErrorMessage = errorMessage && errorMessage.trim() 
      ? errorMessage.trim() 
      : 'An unexpected error occurred while fetching wishlist'
    
    return {
      wishlist: null,
      items: [],
      error: finalErrorMessage,
    }
  }
}

// Add item to wishlist
export async function addToWishlist(
  variantId: string
): Promise<ApiResponse<{ wishlist: Wishlist }>> {
  const customerId = await getCustomerId()
  if (!customerId) {
    return {
      success: false,
      error: 'Please log in to add items to your wishlist',
    }
  }

  try {
    const authHeaders = await getAuthHeaders()
    
    if (!PUBLISHABLE_API_KEY) {
      throw new Error('Publishable API key is not configured')
    }
    
    if (!authHeaders.authorization) {
      throw new Error('Authentication required. Please log in.')
    }
    
    if (!BACKEND_URL) {
      throw new Error('Backend URL is not configured')
    }
    
    let response: Response
    try {
      response = await fetch(`${BACKEND_URL}/store/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
          Authorization: authHeaders.authorization,
        },
        credentials: 'include',
        body: JSON.stringify({ variant_id: variantId }),
      })
    } catch (fetchError) {
      // Network error or fetch failed
      const networkError =
        fetchError instanceof Error
          ? fetchError.message
          : 'Network error: Unable to connect to the backend server'
      
      console.error('Fetch error in addToWishlist:', {
        fetchError,
        url: `${BACKEND_URL}/store/wishlist`,
        message: networkError,
      })
      
      throw new Error(
        `Unable to connect to backend server. Please ensure the Medusa backend is running at ${BACKEND_URL}`
      )
    }

    if (!response.ok) {
      let errorMessage = `Failed to add item: ${response.status} ${response.statusText}`
      let errorData: any = null
      
      // Try to parse error response - try JSON first, fallback to text
      try {
        // Try to read as JSON first (Medusa usually returns JSON errors)
        errorData = await response.json()
      } catch (jsonError) {
        // If JSON parsing fails, try to read as text
        try {
          // Clone response if possible to read as text
          const clonedResponse = response.clone?.() || response
          const text = await clonedResponse.text()
          if (text) {
            // Try to parse as JSON one more time
            try {
              errorData = JSON.parse(text)
            } catch {
              // If not JSON, use text as error message
              errorMessage = text || errorMessage
            }
          }
        } catch (textError) {
          console.error('Error reading error response:', textError)
          // Use status-based error message
        }
      }
      
      // Extract error message from various possible formats (Medusa v2 error format)
      if (errorData) {
        // Medusa errors can be in different formats:
        // { message: "..." }
        // { error: { message: "..." } }
        // { type: "...", message: "..." }
        // Just a string
        errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          errorData.detail ||
          errorData.type ||
          (typeof errorData === 'string' ? errorData : errorMessage)
        
        // If errorMessage still contains "Unknown error", try to get more info
        if (errorMessage.includes('Unknown error') && errorData) {
          // Try to stringify the whole error object for debugging
          try {
            const errorStr = JSON.stringify(errorData, null, 2)
            if (errorStr && errorStr !== '{}') {
              console.error('Full error data:', errorStr)
              // Try to extract any useful info from the error object
              if (errorData.code) errorMessage += ` (Code: ${errorData.code})`
              if (errorData.type) errorMessage += ` (Type: ${errorData.type})`
            }
          } catch (e) {
            // Ignore stringify errors
          }
        }
      }
      
      // Log detailed error for debugging
      console.error('Wishlist API Error (POST):', {
        status: response.status,
        statusText: response.statusText,
        url: `${BACKEND_URL}/store/wishlist`,
        errorData,
        message: errorMessage,
        variantId,
      })
      
      throw new Error(errorMessage)
    }

    const data: { wishlist: Wishlist } = await response.json()
    return {
      success: true,
      data: { wishlist: data.wishlist },
    }
  } catch (error) {
    let errorMessage = 'Failed to add item to wishlist'
    
    try {
      if (error instanceof Error) {
        errorMessage = error.message || error.name || error.toString()
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        const err = error as any
        errorMessage =
          err.message ||
          err.error ||
          err.reason ||
          err.toString() ||
          JSON.stringify(error)
      } else {
        errorMessage = String(error) || 'An unknown error occurred'
      }
    } catch (parseError) {
      console.error('Error parsing error object:', parseError)
      errorMessage = 'An unexpected error occurred while adding to wishlist'
    }
    
    // Enhanced logging
    console.error('=== addToWishlist ERROR START ===')
    console.error('Error object:', error)
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    console.error('Error message:', errorMessage)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
    }
    if (error && typeof error === 'object') {
      try {
        console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (jsonErr) {
        console.error('Could not stringify error:', jsonErr)
      }
    }
    console.error('=== addToWishlist ERROR END ===')
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Remove item from wishlist
export async function removeFromWishlist(
  itemId: string
): Promise<ApiResponse<{ wishlist: Wishlist }>> {
  const customerId = await getCustomerId()
  if (!customerId) {
    return {
      success: false,
      error: 'Please log in to remove items from your wishlist',
    }
  }

  try {
    const authHeaders = await getAuthHeaders()
    const response = await fetch(`${BACKEND_URL}/store/wishlist/${itemId}`, {
      method: 'DELETE',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY || '',
        ...(authHeaders.authorization ? { Authorization: authHeaders.authorization } : {}),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      let errorMessage = `Failed to remove item: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
      }
      
      // Log detailed error for debugging
      console.error('Wishlist API Error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
      })
      
      throw new Error(errorMessage)
    }

    const data: { wishlist: Wishlist } = await response.json()
    return {
      success: true,
      data: { wishlist: data.wishlist },
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Failed to remove item from wishlist'
    
    console.error('removeFromWishlist error:', errorMessage, error)
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Get wishlist items with product details
export async function getWishlistItems(): Promise<{
  items: WishlistItem[]
  error: string | null
}> {
  const { items, error } = await getWishlist()
  return { items, error }
}

// Check if a variant is in the wishlist
export async function isVariantInWishlist(
  variantId: string
): Promise<{ inWishlist: boolean; itemId: string | null; error?: string }> {
  try {
    const { items, error } = await getWishlistItems()

    if (error) {
      return {
        inWishlist: false,
        itemId: null,
        error,
      }
    }

    const item = items.find(
      (item) => item.product_variant_id === variantId
    )
    return {
      inWishlist: !!item,
      itemId: item?.id || null,
    }
  } catch (error) {
    return {
      inWishlist: false,
      itemId: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to check wishlist status',
    }
  }
}

// Check if a product (by handle) is in the wishlist (for backward compatibility)
export async function isInWishlist(
  productHandle: string
): Promise<{ inWishlist: boolean; itemId: string | null; error?: string }> {
  try {
    const { items, error } = await getWishlistItems()

    if (error) {
      return {
        inWishlist: false,
        itemId: null,
        error,
      }
    }

    const item = items.find(
      (item) => item.product_variant?.product?.handle === productHandle
    )
    return {
      inWishlist: !!item,
      itemId: item?.id || null,
    }
  } catch (error) {
    return {
      inWishlist: false,
      itemId: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to check wishlist status',
    }
  }
}