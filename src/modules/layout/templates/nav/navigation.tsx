'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
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

  const navRef = useRef<HTMLDivElement>(null)

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
    <div
      ref={navRef}
      className="flex items-center gap-1 self-stretch"
      role="menubar"
    >
      {navigation.map((item: NavItem, index: number) => {
        const handle = item.name.toLowerCase().replace(' ', '-')
        const isCategories =
          handle === 'shop' && pathname.includes(`/${countryCode}/categories`)
        const active = pathname.includes(`/${countryCode}/${handle}`)
        const isDropdownOpen = openDropdown?.name === item.name

        return (
          <DropdownMenu
            key={index}
            item={item}
            activeItem={openDropdown || { name: '', handle: '' }}
            isOpen={isDropdownOpen}
            onOpenChange={(open) => {
              setOpenDropdown(
                open ? { name: item.name, handle: item.handle } : null
              )
            }}
            customContent={
              item.name === 'Collections' ? (
                <CollectionsMenu
                  cmsCollections={strapiCollections}
                  medusaCollections={collections}
                />
              ) : undefined
            }
          >
            <div
              className="flex h-full items-center"
              data-testid={formatNameForTestId(`${item.name}-dropdown`)}
            >
              <NavigationItem
                href={`/${countryCode}${item.handle}`}
                className={cn(
                  'relative flex items-center gap-1.5 !py-2 px-3.5 text-[13.5px] font-medium tracking-[0.01em] transition-all duration-200',
                  'hover:text-basic-primary dark:hover:text-white',
                  {
                    'text-action-primary font-semibold dark:text-brand-400':
                      active || isCategories,
                    'text-action-primary dark:text-brand-400': isDropdownOpen,
                  }
                )}
              >
                {item.name}
                {(item.name === 'Boutique' || item.name === 'Collections') && (
                  <ChevronDownIcon
                    className={cn(
                      'h-3 w-3 opacity-60 transition-transform duration-200',
                      isDropdownOpen ? 'rotate-180 opacity-100' : ''
                    )}
                  />
                )}
                {/* Active indicator */}
                <span
                  className={cn(
                    'absolute bottom-[-1px] left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-action-primary to-action-primary/70 transition-all duration-300 dark:from-brand-400 dark:to-brand-400/70',
                    active || isCategories || isDropdownOpen ? 'w-4/5' : 'w-0'
                  )}
                />
              </NavigationItem>
            </div>
          </DropdownMenu>
        )
      })}
    </div>
  )
}
