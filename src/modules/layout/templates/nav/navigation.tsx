'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { createNavigation } from '@lib/constants'
import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { NavigationItem } from '@modules/common/components/navigation-item'
import { ChevronDownIcon } from '@modules/common/icons'
import { CollectionsData } from 'types/strapi'

import CollectionsMenu from './collections-menu'
import DropdownMenu from './dropdown-menu'

interface NavItem {
  name: string
  handle: string
  category_children?: any[] | null
}

export default function Navigation({
  countryCode,
  productCategories,
  collections,
  strapiCollections,
}: {
  countryCode: string
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
}) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<{
    name: string
    handle: string
  } | null>(null)

  const navRef = useRef<HTMLElement>(null)

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  // Close dropdown on outside click
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        openDropdown &&
        navRef.current &&
        !navRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null)
      }
    },
    [openDropdown]
  )

  // Close on Escape
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDropdown) {
        setOpenDropdown(null)
      }
    },
    [openDropdown]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleClickOutside, handleEscapeKey])

  // Close on route change
  useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className="flex h-full items-stretch gap-0.5 self-stretch"
    >
      {navigation.map((item: NavItem, index: number) => {
        const isShop = item.name === 'Boutique'
        const isCollections = item.name === 'Collections'
        const hasDropdown = isShop || isCollections
        const active = isShop
          ? pathname.includes(`/${countryCode}/categories`) ||
            pathname.includes(`/${countryCode}/products`) ||
            pathname === `/${countryCode}/shop`
          : isCollections
            ? pathname.includes(`/${countryCode}/collections`)
            : pathname.includes(`/${countryCode}${item.handle}`)
        const isDropdownOpen = openDropdown?.name === item.name

        return (
          <DropdownMenu
            key={index}
            item={item}
            isOpen={isDropdownOpen}
            onOpenChange={(open) => {
              setOpenDropdown((current) => {
                if (!open) {
                  // Ignore a delayed close from a menu that is no longer
                  // active after the pointer moved to another nav item.
                  return current?.name === item.name ? null : current
                }

                if (current?.name === item.name) return current
                return { name: item.name, handle: item.handle }
              })
            }}
            customContent={
              isCollections ? (
                <CollectionsMenu
                  cmsCollections={strapiCollections}
                  medusaCollections={collections}
                />
              ) : undefined
            }
          >
            {(triggerProps) => (
              <NavigationItem
                {...triggerProps}
                href={`/${countryCode}${item.handle}`}
                data-testid={formatNameForTestId(`${item.name}-dropdown`)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'group relative flex h-full items-center gap-1.5 px-3 font-jakarta text-[15px] font-semibold tracking-[0.01em] transition-colors duration-200 xl:px-3.5 min-h-[44px]',
                  active || isDropdownOpen
                    ? 'bg-[#0F1B33] text-white dark:bg-[#0F1B33] dark:text-white'
                    : 'text-basic-primary/75 hover:text-[#1D4ED8] dark:text-white/65 dark:hover:text-[#1D4ED8]'
                )}
              >
                {item.name}
                {hasDropdown && (
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={cn(
                      'h-3 w-3 opacity-55 transition-transform duration-200',
                      isDropdownOpen ? 'rotate-180 opacity-100' : ''
                    )}
                  />
                )}

                {/* Active pill background (handled on the link itself) */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-[2px] rounded-full transition-all duration-300',
                    active || isDropdownOpen
                      ? 'bg-[#1D4ED8] opacity-100 dark:bg-[#1D4ED8]'
                      : 'bg-basic-primary/15 opacity-0 group-hover:opacity-100 dark:bg-white/20'
                  )}
                />
              </NavigationItem>
            )}
          </DropdownMenu>
        )
      })}
    </nav>
  )
}
