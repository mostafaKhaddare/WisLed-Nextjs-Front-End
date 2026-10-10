'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, WisLedLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const [mobileQuery, setMobileQuery] = useState('')
  const router = useRouter()

  // Reuses the storefront's existing results route rather than a bespoke
  // search page, so the behaviour matches desktop search exactly.
  const submitMobileSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = mobileQuery.trim()
    if (!query) return
    router.push(`/results/${encodeURIComponent(query)}`)
    setMobileQuery('')
  }

  return (
    <>
      {/* ─── MOBILE LAYOUT ─── */}
      <Box className="flex w-full flex-1 flex-col large:hidden">
        <Box className="flex w-full items-center justify-between">
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

          {/* Right: Actions */}
          <Box className="flex items-center">{props.navActions}</Box>
        </Box>

        {/*
          Search field below the bar. On touch the icon is replaced by this
          always-visible input so the query is typed in place instead of behind
          a dialog.
        */}
        <form
          role="search"
          onSubmit={submitMobileSearch}
          className="mb-3 mt-2 flex h-12 items-center gap-2.5 rounded-[14px] bg-[#F0F2F8] px-3.5"
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-[#5B6577]" />
          <input
            type="search"
            value={mobileQuery}
            onChange={(event) => setMobileQuery(event.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="min-w-0 flex-1 border-0 bg-transparent font-jakarta text-sm text-[#0F1B33] outline-none placeholder:text-[#5B6577] dark:text-white"
          />
        </form>
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
    </>
  )
}
