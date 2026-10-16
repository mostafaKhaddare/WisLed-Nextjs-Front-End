'use client'

import React, { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'

import { createNavigation } from '@lib/constants'
import { resolveCollectionImage } from '@lib/util/collection-image'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@modules/common/components/dialog'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { ArrowLeftIcon, BarsIcon, SearchIcon, XIcon } from '@modules/common/icons'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { CollectionsData } from 'types/strapi'

interface CategoryItem {
  name: string
  handle: string
  image?: { url: string; alt?: string } | null
  icon?: React.ReactNode
  category_children?: CategoryItem[] | null
  type?: string
  handle_id?: string
}

const SideMenu = ({
  productCategories,
  collections,
  strapiCollections,
}: {
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
}) => {
  const [categoryStack, setCategoryStack] = useState<CategoryItem[]>([])
  const currentCategory =
    categoryStack[categoryStack.length - 1] || null
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  const handleDrillInto = (category: CategoryItem) => {
    setCategoryStack([...categoryStack, { name: category.name, handle: category.handle }])
  }

  const handleBack = () => {
    setCategoryStack(categoryStack.slice(0, -1))
  }

  const handleClose = () => {
    setIsOpen(false)
    setCategoryStack([])
  }

  const handleOpenDialogChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setCategoryStack([])
      setIsSearchOpen(false)
      setSearchValue('')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      const countryCode = window.location.pathname.match(/^\/([a-zA-Z-]+)/)?.[1] || ''
      window.location.href = `/${countryCode}/blog?q=${encodeURIComponent(searchValue.trim())}`
    }
  }

  const renderCategories = (categories: CategoryItem[]) => {
    const lastCategoryIndex = categories.findLastIndex(
      (cat) => cat.type === 'parent_category'
    )

    return categories.map((item, index) => {
      const hasChildren =
        item.category_children && item.category_children.length > 0

      const strapiCollection = strapiCollections.data.find(
        (cmsCollection) => cmsCollection.Handle === item.handle_id
      )
      const medusaCollection = collections.find(
        (collection) => collection.handle === item.handle_id
      )
      // Medusa `metadata.image` wins over the CMS image so a collection image
      // can be managed straight from the Medusa admin. See
      // `@lib/util/collection-image`.
      const collectionImage = resolveCollectionImage(
        medusaCollection?.metadata?.image,
        strapiCollection?.Image?.url
      )
      const collectionTitle =
        strapiCollection?.Title || medusaCollection?.title || item.name

      if (item.type === 'collection' && (strapiCollection || collectionImage)) {
        return (
          <LocalizedClientLink
            key={index}
            href={item.handle}
            className="relative mb-2 block overflow-hidden rounded-xl"
            onClick={handleClose}
          >
            {collectionImage ? (
              <Image
                src={collectionImage}
                alt={collectionTitle}
                width={600}
                height={160}
                className="h-[160px] w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-[160px] w-full bg-gradient-to-br from-[#0F1B33] via-[#16305c] to-[#1D4ED8]"
              />
            )}
            <Box className="absolute bottom-6 left-6">
              <Heading
                as="h3"
                className="text-xl text-white font-bold"
              >
                {collectionTitle}
              </Heading>
            </Box>
          </LocalizedClientLink>
        )
      }

      return (
        <Fragment key={index}>
          {hasChildren ? (
            <div className="flex items-center overflow-hidden rounded-xl border-b border-[#E5E7EB]">
              <LocalizedClientLink
                href={item.handle}
                className="flex flex-1 items-center gap-3 py-3.5 pl-4 pr-2 min-w-0"
                onClick={handleClose}
              >
                {item.image ? (
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ) : item.icon ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#0F1B33]">
                    {item.icon}
                  </span>
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8]/10 text-[13px] font-black text-[#1D4ED8]">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="flex-1 truncate text-[14px] font-semibold text-[#0F1B33]">
                  {item.name}
                </span>
              </LocalizedClientLink>
              <button
                type="button"
                aria-label={`Voir les sous-catégories de ${item.name}`}
                onClick={() => handleDrillInto(item)}
                className="flex h-full items-center justify-center px-4 py-3.5 text-[#5B6577] hover:text-[#1D4ED8]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <LocalizedClientLink
              href={item.handle}
              onClick={handleClose}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-[#5B6577] hover:bg-[#F7F8FC] hover:text-[#1D4ED8]"
            >
              {item.image ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ) : item.icon ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#0F1B33]">
                  {item.icon}
                </span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7F8FC] text-[13px] font-black text-[#5B6577]">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="flex-1 truncate">{item.name}</span>
            </LocalizedClientLink>
          )}

          {index === lastCategoryIndex && (
            <div className="my-4 border-t border-[#E5E7EB]" />
          )}
        </Fragment>
      )
    })
  }

  const getActiveCategories = (): CategoryItem[] => {
    let currentCategories: CategoryItem[] = [
      ...(navigation[0]?.category_children || []),
      ...navigation.slice(1),
    ]

    for (const category of categoryStack) {
      const found = currentCategories.find((item) => item.name === category.name)
      if (found?.category_children) {
        currentCategories = found.category_children.map((c) => ({
          ...c,
          icon: null,
        }))
      } else {
        break
      }
    }
    return currentCategories
  }

  const activeCategories = getActiveCategories()

  const renderViewAllRow = () => {
    if (!currentCategory) return null
    return (
      <LocalizedClientLink
        href={currentCategory.handle}
        onClick={handleClose}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8]/8 px-4 py-3 text-[13px] font-bold text-[#1D4ED8]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
          />
        </svg>
        Voir tous les produits — {currentCategory.name}
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </LocalizedClientLink>
    )
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/${window.location.pathname.match(/^\/([a-zA-Z-]+)/)?.[1] || ''}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenDialogChange}>
      <DialogTrigger asChild>
        <Button
          variant="filled"
          withIcon
          size="md"
          className="flex h-auto !p-2 xsmall:!p-2.5 large:hidden"
        >
          <BarsIcon />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="!max-h-full !max-w-full !rounded-none !p-0"
          aria-describedby={undefined}
        >
          <div className="flex h-full flex-col" style={{ maxHeight: '100vh' }}>
            {/* ── Header ── */}
            <DialogHeader className="flex items-center justify-between !p-4 !pb-3">
              <div className="flex items-center gap-3">
                {currentCategory && (
                  <Button
                    variant="filled"
                    withIcon
                    size="sm"
                    onClick={handleBack}
                    className="!p-1.5"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Button>
                )}
                <button
                  onClick={handleLogoClick}
                  className="text-[15px] font-bold text-[#0F1B33]"
                >
                  WisLed
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!isSearchOpen && (
                  <button
                    type="button"
                    aria-label="Rechercher"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0F1B33] hover:bg-[#F7F8FC]"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                )}
                <Button
                  onClick={handleClose}
                  variant="text"
                  withIcon
                  size="sm"
                  className="!p-1.5"
                >
                  <XIcon />
                </Button>
              </div>
            </DialogHeader>

            {/* ── Search bar (inline when open) ── */}
            {isSearchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2.5 border-b border-[#E5E7EB] px-4 py-3.5"
              >
                <Button
                  type="button"
                  variant="text"
                  withIcon
                  size="sm"
                  className="!p-1.5"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchValue('')
                  }}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Rechercher un produit…"
                  aria-label="Rechercher un produit"
                  autoFocus
                  className="flex-1 border-0 bg-transparent text-[14px] text-[#0F1B33] placeholder:text-[#9CA3AF] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Valider la recherche"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1D4ED8]"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
              </form>
            )}

            <VisuallyHidden.Root>
              <DialogTitle>Menu modal</DialogTitle>
            </VisuallyHidden.Root>

            {/* ── Body ── */}
            <DialogBody className="flex-1 overflow-y-auto p-4 small:p-5">
              {renderViewAllRow()}

              <Box className="flex flex-col gap-1">
                {renderCategories(activeCategories)}
              </Box>
            </DialogBody>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default SideMenu
