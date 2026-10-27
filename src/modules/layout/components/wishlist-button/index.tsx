'use client'

import { useWishlist } from '@lib/context/wishlist-context'
import { HeartIcon } from '@modules/common/icons'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Box } from '@modules/common/components/box'
import { cn } from '@lib/util/cn'

export default function WishlistButton() {
  const { count } = useWishlist()
  const hasItems = count > 0

  return (
    <LocalizedClientLink href="/wishlist" data-testid="nav-wishlist-link">
      <Box
        className={cn(
          'relative rounded-full !p-2 transition-all duration-200 xsmall:!p-3.5  dark:text-white dark:hover:bg-white/20 dark:hover:text-white dark:active:bg-white/15 dark:active:text-white',
          'focus-within:ring-2 focus-within:ring-[#E5484D] focus-within:ring-offset-2',
          hasItems
            ? 'text-[#E5484D] hover:bg-[#E5484D]/10 active:bg-[#E5484D]/20 dark:hover:bg-[#E5484D]/30'
            : 'text-black hover:bg-fg-secondary-hover hover:text-action-primary-hover active:bg-fg-secondary-pressed dark:text-white dark:hover:bg-white/10'
        )}
      >
        <HeartIcon
          className={cn(
            'h-5 w-5 xsmall:h-6 xsmall:w-6 transition-transform duration-300',
            hasItems && 'fill-[#E5484D] scale-110'
          )}
          filled={hasItems}
        />
        {hasItems && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold leading-none text-white shadow-sm xsmall:-right-1 xsmall:-top-1 xsmall:h-5 xsmall:min-w-5 xsmall:text-xs">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Box>
    </LocalizedClientLink>
  )
}
