'use client'

import React, { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'

import { createNavigation } from '@lib/constants'
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
import Divider from '@modules/common/components/divider'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {
  ArrowLeftIcon,
  BarsIcon,
  XIcon,
} from '@modules/common/icons'
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
  const currentCategory = categoryStack[categoryStack.length - 1] || null
  const [isOpen, setIsOpen] = useState(false)

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
    if (!open) setCategoryStack([])
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Render the list of items at the current level of the navigation stack
     ───────────────────────────────────────────────────────────────────────── */
  const renderCategories = (categories: CategoryItem[]) => {
    const lastCategoryIndex = categories.findLastIndex(
      (cat) => cat.type === 'parent_category'
    )

    return categories.map((item, index) => {
      const hasChildren = item.category_children && item.category_children.length > 0

      /* ── Collection items with a Strapi image ── */
      const strapiCollection = strapiCollections.data.find(
        (cmsCollection) => cmsCollection.Handle === item.handle_id
      )

      if (item.type === 'collection' && strapiCollection) {
        return (
          <LocalizedClientLink
            key={index}
            href={item.handle}
            className="relative mb-2 block overflow-hidden rounded-xl"
            onClick={handleClose}
          >
            <Image
              src={process.env.NEXT_PUBLIC_STRAPI_URL + strapiCollection.Image.url}
              alt={strapiCollection.Title}
              width={600}
              height={160}
              className="h-[160px] w-full object-cover"
            />
            <Box className="absolute bottom-6 left-6">
              <Heading as="h3" className="text-xl text-static font-bold">
                {strapiCollection.Title}
              </Heading>
            </Box>
          </LocalizedClientLink>
        )
      }

      /* ── Parent / subcategory items ── */
      return (
        <Fragment key={index}>
          {hasChildren ? (
            /* ── Split row: [thumbnail + name link | chevron drill button] ── */
            <div className="flex w-full items-center overflow-hidden rounded-xl border border-basic-primary/[0.06] bg-primary/60 dark:border-white/[0.05] dark:bg-white/[0.03] transition-colors duration-150 hover:border-basic-primary/[0.12] dark:hover:border-white/[0.09]">

              {/* LEFT: tap category name → navigate to category page */}
              <LocalizedClientLink
                href={item.handle}
                className="flex flex-1 items-center gap-3 py-3.5 pl-4 pr-2 min-w-0"
                onClick={handleClose}
              >
                {/* Thumbnail image */}
                {item.image ? (
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ) : item.icon ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary">
                    {item.icon}
                  </span>
                ) : (
                  /* Coloured initial fallback */
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-action-primary/10 text-[13px] font-black text-action-primary dark:bg-brand-400/10 dark:text-brand-400">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="flex-1 truncate text-[14px] font-semibold text-basic-primary dark:text-white/90">
                  {item.name}
                </span>

              </LocalizedClientLink>

              {/* Vertical separator */}
              <div className="h-8 w-px bg-basic-primary/[0.08] dark:bg-white/[0.07]" />

              {/* RIGHT: chevron-only button → drill into sub-categories */}
              <button
                type="button"
                aria-label={`Voir les sous-catégories de ${item.name}`}
                onClick={() => handleDrillInto(item)}
                className="flex h-full items-center justify-center px-4 py-3.5 text-secondary transition-colors duration-150 hover:bg-action-primary/5 hover:text-action-primary dark:hover:bg-brand-400/5 dark:hover:text-brand-400 active:bg-action-primary/10"
              >
                {/* Animated chevron */}
                <svg
                  className="h-5 w-5 transition-transform duration-200 hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          ) : (
            /* ── Leaf item (no children) — full row is a link ── */
            <LocalizedClientLink
              href={item.handle}
              onClick={handleClose}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3.5 text-[14px] font-semibold text-basic-primary/80 transition-all duration-150 hover:border-basic-primary/[0.08] hover:bg-primary/60 hover:text-basic-primary dark:text-white/60 dark:hover:border-white/[0.05] dark:hover:bg-white/[0.04] dark:hover:text-white/90"
            >
              {item.image ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ) : item.icon ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary">
                  {item.icon}
                </span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-[13px] font-black text-secondary dark:bg-white/[0.05] dark:text-white/30">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="flex-1 truncate">{item.name}</span>
            </LocalizedClientLink>
          )}

          {/* Divider after the last parent_category before collections */}
          {index === lastCategoryIndex && (
            <Divider className="my-4 -ml-4 w-[calc(100%+2rem)]" />
          )}
        </Fragment>
      )
    })
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Walk the category stack to get the items visible at the current level
     ───────────────────────────────────────────────────────────────────────── */
  const getActiveCategories = (): CategoryItem[] => {
    let currentCategories: CategoryItem[] = [
      ...(navigation[0]?.category_children || []),
      ...navigation.slice(1),
    ]

    for (const category of categoryStack) {
      const found = currentCategories.find((item) => item.name === category.name)
      if (found?.category_children) {
        currentCategories = found.category_children.map((c) => ({ ...c, icon: null }))
      } else {
        break
      }
    }
    return currentCategories
  }

  const activeCategories = getActiveCategories()

  /* ─────────────────────────────────────────────────────────────────────────
     "See all" shortcut for the current drill-level
     ───────────────────────────────────────────────────────────────────────── */
  const renderViewAllRow = () => {
    if (!currentCategory) return null
    return (
      <LocalizedClientLink
        href={currentCategory.handle}
        onClick={handleClose}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-action-primary/8 px-4 py-3 text-[13px] font-bold text-action-primary transition-all duration-200 hover:bg-action-primary/12 dark:bg-brand-400/8 dark:text-brand-400 dark:hover:bg-brand-400/12"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
        </svg>
        Voir tous les produits — {currentCategory.name}
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      </LocalizedClientLink>
    )
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
          className="!max-h-full !max-w-full !rounded-none"
          aria-describedby={undefined}
        >
          {/* ── Header ── */}
          <DialogHeader className="flex items-center gap-3 !p-4 text-xl text-basic-primary small:text-2xl">
            {currentCategory && (
              <Button variant="filled" withIcon size="sm" onClick={handleBack}>
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            )}

            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate font-bold">
                {currentCategory?.name || 'Menu'}
              </span>
            </div>

            <Button
              onClick={handleClose}
              variant="text"
              withIcon
              size="sm"
              className="ml-auto shrink-0 p-2"
            >
              <XIcon />
            </Button>
          </DialogHeader>

          <VisuallyHidden.Root>
            <DialogTitle>Menu modal</DialogTitle>
          </VisuallyHidden.Root>

          {/* ── Body ── */}
          <DialogBody className="overflow-y-auto p-4 small:p-5">

            {/* "View all products" CTA when drilled into a category */}
            {renderViewAllRow()}

            <Box className="flex flex-col gap-2">
              {renderCategories(activeCategories)}
            </Box>


          </DialogBody>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default SideMenu
