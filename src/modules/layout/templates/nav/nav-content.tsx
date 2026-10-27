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
      <Box className="hidden min-h-16 w-full items-center justify-between gap-3 large:flex">
        {/* LEFT: Logo */}
        <Box className="relative flex shrink-0 items-center">
          <LocalizedClientLink
            href="/"
            className="focus-visible:ring-action-primary/25 block transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            aria-label="WisLED, retour à l'accueil"
          >
            <WisLedLogo className="h-6 xl:h-7" />
          </LocalizedClientLink>
        </Box>

        {/* CENTER: Navigation links */}
        <Box className="flex min-w-0 flex-1 items-stretch justify-center self-stretch px-2 xl:px-8">
          <Navigation
            countryCode={props.countryCode}
            productCategories={props.productCategories}
            collections={props.collections}
            strapiCollections={props.strapiCollections}
          />
        </Box>

        {/* RIGHT: Search + Actions */}
        <Box className="flex shrink-0 items-center gap-2.5 xl:gap-3">
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
                type="button"
                onClick={() => setIsDesktopSearchOpen(true)}
                aria-label="Rechercher un produit"
                className="focus-visible:ring-action-primary/25 group flex h-10 w-[176px] items-center gap-2.5 rounded-[14px] border border-[#E4E7EF] bg-[#F0F2F8] px-4 text-left font-jakarta text-[12.5px] text-[#0F1B33] transition-all duration-200 hover:border-[#1D4ED8] hover:bg-[#F0F2F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:border-white/10 dark:bg-white/[0.045] dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white/80 xl:w-[232px] 2xl:w-[280px]"
                data-testid="search-button-desktop"
              >
                <SearchIcon className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover:text-action-primary dark:group-hover:text-wisled-400" />
                <span className="truncate">
                  <span className="xl:hidden">Rechercher…</span>
                  <span className="hidden xl:inline">
                    Rechercher un produit…
                  </span>
                </span>
              </button>
            )}
          </Box>
          {props.navActions}
        </Box>
      </Box>
    </>
  )
}
