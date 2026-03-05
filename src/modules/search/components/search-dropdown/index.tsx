import React, { Fragment, useEffect, useRef } from 'react'

import { cn } from '@lib/util/cn'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'

import { ControlledSearchBox } from '../search-box'
import { RecentSearches } from './recent-searches'
import { RecommendedItem } from './recommended-item'

export default function SearchDropdown({
  isOpen,
  countryCode,
  setIsOpen,
  recommendedProducts,
}: {
  setIsOpen: (value: boolean) => void
  isOpen: boolean
  countryCode: string
  recommendedProducts: StoreProduct[]
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    // Small delay so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 50)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, setIsOpen])

  return (
    <div
      ref={dropdownRef}
      className="w-full large:relative large:z-30 large:block"
    >
      {/* Search input */}
      <ControlledSearchBox
        countryCode={countryCode}
        open={isOpen}
        closeSearch={() => setIsOpen(false)}
      />

      {/* Dropdown panel */}
      <Box
        className={cn(
          'absolute right-0 top-full z-50 mt-4 w-[750px] origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-3xl transition-all duration-300 ease-out',
          'dark:border-white/[0.08] dark:bg-[#121212]/95 dark:shadow-black/50',
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <div className="flex min-h-[320px]">
          {/* Left Column: Recent Searches */}
          <Box className="flex w-[260px] shrink-0 flex-col border-r border-gray-100 bg-gray-50/60 p-6 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <Text size="md" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Récent
              </Text>
            </div>
            <div className="flex-1">
              <RecentSearches handleOpenDialogChange={setIsOpen} />
            </div>
          </Box>

          {/* Right Column: Recommended */}
          <Box className="flex-1 p-6">
            <div className="mb-5 flex items-center border-b border-gray-100 pb-3 dark:border-white/[0.08]">
              <Text size="md" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Produits Recommandés
              </Text>
            </div>
            <div className="grid gap-4">
              {recommendedProducts.length > 0 ? (
                recommendedProducts.map((item, id) => (
                  <Fragment key={id}>
                    <RecommendedItem
                      item={item}
                      handleOpenDialogChange={setIsOpen}
                    />
                  </Fragment>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Text className="text-sm text-gray-400 dark:text-gray-500">
                    Découvrez nos nouveautés
                  </Text>
                </div>
              )}
            </div>
          </Box>
        </div>
      </Box>
    </div>
  )
}
