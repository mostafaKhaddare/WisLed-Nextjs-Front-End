'use client'

import { useState } from 'react'


import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, WisLedLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <Box className="flex items-center flex-1">
        <Box className="flex large:hidden">
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
        <Box className="flex-1 flex justify-center">
          {!isSearchOpen && (
            <Navigation
              countryCode={props.countryCode}
              productCategories={props.productCategories}
              collections={props.collections}
              strapiCollections={props.strapiCollections}
            />
          )}
          {isSearchOpen && (
            <SearchDropdown
              setIsOpen={setIsSearchOpen}
              recommendedProducts={props.products}
              isOpen={isSearchOpen}
              countryCode={props.countryCode}
            />
          )}
        </Box>
        {!isSearchOpen && (
          <Button
            variant="icon"
            withIcon
            className="ml-auto h-auto !p-2 xsmall:!p-3.5"
            onClick={() => setIsSearchOpen(true)}
            data-testid="search-button"
          >
            <SearchIcon />
          </Button>
        )}
      </Box>
      <SearchDialog
        recommendedProducts={props.products}
        countryCode={props.countryCode}
        isOpen={isSearchOpen}
        handleOpenDialogChange={setIsSearchOpen}
      />
    </>
  )
}
