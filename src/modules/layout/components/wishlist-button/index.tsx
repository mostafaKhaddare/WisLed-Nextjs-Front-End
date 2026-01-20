'use client'

import { useEffect, useState } from 'react'
import { getWishlist } from '@lib/data/wishlist'
import { HeartIcon } from '@modules/common/icons'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Box } from '@modules/common/components/box'

export default function WishlistButton() {
  const [itemCount, setItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false) // Start as false to show icon immediately

  useEffect(() => {
    let isMounted = true

    const fetchWishlistCount = async () => {
      try {
        const { items, error } = await getWishlist()
        if (!isMounted) return

        if (error) {
          // If not authenticated, just show 0 count
          if (error === 'Not logged in' || error === 'Not authenticated') {
            setItemCount(0)
          } else {
            console.error('Error fetching wishlist count:', error)
            setItemCount(0)
          }
        } else {
          setItemCount(items?.length || 0)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching wishlist count:', error)
        setItemCount(0)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Fetch in background without blocking UI
    fetchWishlistCount()

    // Refresh count periodically (less frequent to reduce load)
    const interval = setInterval(fetchWishlistCount, 60000) // Every 60 seconds instead of 30

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <LocalizedClientLink href="/wishlist" data-testid="nav-wishlist-link">
      <Box className="relative rounded-full bg-transparent !p-2 text-action-primary hover:bg-fg-secondary-hover hover:text-action-primary-hover active:bg-fg-secondary-pressed active:text-action-primary-pressed xsmall:!p-3.5">
        <HeartIcon
          className="h-2 w-2 xsmall:h-6 xsmall:w-6"
          filled={itemCount > 0}
        />
        {itemCount > 0 && !isLoading && (
          <span className="absolute left-[14px] top-[-12px] flex h-4 w-4 items-center justify-center rounded-full bg-fg-primary-negative text-[10px] text-white xsmall:left-[18px] xsmall:top-[-16px] xsmall:h-5 xsmall:w-5 xsmall:text-sm">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Box>
    </LocalizedClientLink>
  )
}

