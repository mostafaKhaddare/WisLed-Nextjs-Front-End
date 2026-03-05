'use client'

import { useState } from 'react'

import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, WisLedLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)

  return (
    <>
      {/* ─── MOBILE LAYOUT ─── */}
      <Box className="flex items-center justify-between w-full flex-1 large:hidden">
        {/* Left: Burger + Logo */}
        <Box className="flex items-center ">
          <Box className="flex">
            <SideMenu
              productCategories={props.productCategories}
              collections={props.collections}
              strapiCollections={props.strapiCollections}
            />
          </Box>
          <Box className="relative block">
            <LocalizedClientLink href="/">
              <WisLedLogo className="h-6 medium:h-7" />
            </LocalizedClientLink>
          </Box>
        </Box>

        {/* Right: Search + Actions */}
        <Box className="flex items-center">
          <button
            className="flex items-center justify-center rounded-full text-black transition-colors hover:bg-fg-secondary-hover !p-2 xsmall:!p-3.5 dark:text-white dark:hover:bg-white/10"
            onClick={() => setIsMobileSearchOpen(true)}
            data-testid="search-button"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          {props.navActions}
        </Box>
      </Box>

      {/* ─── DESKTOP LAYOUT (large screens) ─── */}
      <Box className="hidden w-full items-center justify-between large:flex">
        {/* LEFT: Logo */}
        <Box className="relative shrink-0 flex items-center">
          <LocalizedClientLink href="/" className="block">
            <WisLedLogo className="h-7" />
          </LocalizedClientLink>
        </Box>

        {/* CENTER: Navigation links */}
        <Box className="flex flex-1 items-center justify-center px-8">
          <Navigation
            countryCode={props.countryCode}
            productCategories={props.productCategories}
            collections={props.collections}
            strapiCollections={props.strapiCollections}
          />
        </Box>

        {/* RIGHT: Search + Actions */}
        <Box className="flex items-center gap-2 shrink-0">
          <Box className="relative shrink-0">
            {isDesktopSearchOpen ? (
              <SearchDropdown
                setIsOpen={setIsDesktopSearchOpen}
                recommendedProducts={props.products}
                isOpen={isDesktopSearchOpen}
                countryCode={props.countryCode}
              />
            ) : (
              <button
                onClick={() => setIsDesktopSearchOpen(true)}
                className="flex w-[280px] items-center gap-2 border border-basic-primary/15 bg-secondary px-3.5 py-2 text-sm text-secondary transition-all duration-200 hover:border-basic-primary/25 hover:bg-secondary/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/15 dark:hover:bg-white/[0.08] xl:w-[320px]"
                data-testid="search-button-desktop"
              >
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span>Rechercher un produit...</span>
              </button>
            )}
          </Box>
          {props.navActions}
        </Box>
      </Box>

      {/* Mobile search dialog */}
      <div className="large:hidden">
        <SearchDialog
          recommendedProducts={props.products}
          countryCode={props.countryCode}
          isOpen={isMobileSearchOpen}
          handleOpenDialogChange={setIsMobileSearchOpen}
        />
      </div>
    </>
  )
}
