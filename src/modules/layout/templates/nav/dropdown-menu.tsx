'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

import MegaMenuTrustBar from './mega-menu-trust-bar'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CategoryImage {
  url: string
  alt?: string
}

interface CategoryItem {
  name: string
  handle: string
  image?: CategoryImage | null
  category_children?: CategoryItem[] | null
}

interface TriggerProps {
  id: string
  'aria-haspopup'?: 'true'
  'aria-expanded'?: boolean
  'aria-controls'?: string
  onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void
}

interface DropdownMenuProps {
  item: CategoryItem
  children: (props: TriggerProps) => React.ReactNode
  customContent?: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/* ------------------------------------------------------------------ */
/*  Featured category card                                             */
/* ------------------------------------------------------------------ */

function FeaturedCategoryCard({ category }: { category: CategoryItem }) {
  const initial = category.name.charAt(0).toUpperCase()

  return (
    <LocalizedClientLink
      href={category.handle}
      className="group/feature relative flex h-full min-h-[268px] w-full flex-col justify-end overflow-hidden rounded-2xl border border-basic-primary/[0.06] bg-wisled-950 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-white/[0.06]"
      data-testid={formatNameForTestId(`featured-${category.name}`)}
    >
      {category.image ? (
        <Image
          src={category.image.url}
          alt={category.image.alt || category.name}
          fill
          sizes="(max-width: 1280px) 220px, 260px"
          loading="lazy"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover/feature:scale-[1.04]"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-wisled-950 via-wisled-900 to-wisled-600"
          />
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-sora text-[104px] font-black leading-none text-white/[0.08]"
          >
            {initial}
          </span>
        </>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
      />

      <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-all duration-300 group-hover/feature:border-white group-hover/feature:bg-white group-hover/feature:text-black">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover/feature:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </span>

      <span className="relative p-5">
        <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/60">
          Catégorie
        </span>
        <span className="mt-1.5 block font-sora text-lg font-bold leading-tight text-white">
          {category.name}
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/75 transition-colors duration-200 group-hover/feature:text-white">
          Découvrir
          <svg
            aria-hidden="true"
            className="h-3 w-3 transition-transform duration-200 group-hover/feature:translate-x-0.5"
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
        </span>
      </span>
    </LocalizedClientLink>
  )
}

/* ------------------------------------------------------------------ */
/*  Mega menu                                                          */
/* ------------------------------------------------------------------ */

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  item,
  children,
  customContent,
  isOpen,
  onOpenChange,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const baseId = useId()
  const triggerId = `${baseId}-trigger`
  const panelId = `${baseId}-panel`
  const tabPanelId = `${baseId}-tabpanel`
  const hasMenu = Boolean(
    (item.category_children && item.category_children.length > 0) ||
      customContent
  )
  const [hasOpened, setHasOpened] = useState(false)
  const [activeSidebarIndex, setActiveSidebarIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setHasOpened(true)
      setActiveSidebarIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const focusTrigger = useCallback(() => {
    document.getElementById(triggerId)?.focus()
  }, [triggerId])

  const focusFirstItem = useCallback(() => {
    window.setTimeout(() => {
      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[role="tab"], a[href], button:not([disabled])'
      )
      firstItem?.focus()
    }, 120)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    if (!hasMenu || isOpen || openTimeoutRef.current) return

    // A very short delay avoids opening a menu when the pointer is only
    // travelling across the navigation towards another item.
    openTimeoutRef.current = setTimeout(() => {
      openTimeoutRef.current = null
      onOpenChange(true)
    }, 60)
  }, [hasMenu, isOpen, onOpenChange])

  const handleMouseLeave = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    if (!isOpen || closeTimeoutRef.current) return

    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null

      // Keep the panel open when the pointer leaves but keyboard focus is
      // still inside it (for example, after using the sidebar tabs).
      const focusedElement = document.activeElement
      if (focusedElement && menuRef.current?.contains(focusedElement)) return

      onOpenChange(false)
    }, 240)
  }, [isOpen, onOpenChange])

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node)) return
      onOpenChange(false)
    },
    [onOpenChange]
  )

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (!hasMenu) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!isOpen) onOpenChange(true)
        focusFirstItem()
        return
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        onOpenChange(false)
        focusTrigger()
      }
    },
    [focusFirstItem, focusTrigger, hasMenu, isOpen, onOpenChange]
  )

  const handlePanelKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      event.stopPropagation()
      onOpenChange(false)
      focusTrigger()
    },
    [focusTrigger, onOpenChange]
  )

  const handleTabListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const handledKeys = [
        'ArrowDown',
        'ArrowRight',
        'ArrowUp',
        'ArrowLeft',
        'Home',
        'End',
      ]

      if (!handledKeys.includes(event.key)) return

      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      )
      if (!tabs.length) return

      const currentIndex = tabs.findIndex(
        (tab) => tab === document.activeElement
      )
      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = tabs.length - 1
          break
      }

      event.preventDefault()
      setActiveSidebarIndex(nextIndex)
      tabs[nextIndex]?.focus()
    },
    []
  )

  /* ---------------------------------------------------------------- */
  /*  Sidebar + content layout                                        */
  /* ---------------------------------------------------------------- */

  const renderSidebarLayout = (categories: CategoryItem[]) => {
    if (!categories.length) return null

    const activeIndex = Math.min(
      activeSidebarIndex,
      Math.max(categories.length - 1, 0)
    )
    const activeCategory = categories[activeIndex]
    const activeChildren = activeCategory?.category_children ?? []
    const activeTabId = `${baseId}-tab-${activeIndex}`
    const childCountLabel =
      activeChildren.length === 1
        ? '1 sous-catégorie'
        : `${activeChildren.length} sous-catégories`

    return (
      <div
        className="flex min-h-0 overflow-hidden"
        style={{ maxHeight: 'min(600px, 78vh)' }}
      >
        {/* ── Parent categories ── */}
        <div className="from-secondary/35 to-secondary/10 flex w-[236px] shrink-0 flex-col border-r border-basic-primary/[0.07] bg-gradient-to-b dark:border-white/[0.05] dark:from-white/[0.025] dark:to-transparent xl:w-[260px]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-basic-primary/[0.07] px-5 py-4 dark:border-white/[0.05]">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="bg-action-primary h-1.5 w-1.5 rounded-full dark:bg-wisled-400"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary dark:text-white/40">
                Parcourir
              </span>
            </div>
            <span className="rounded-full bg-primary/70 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-secondary dark:bg-white/[0.06] dark:text-white/40">
              {categories.length}
            </span>
          </div>

          <div
            role="tablist"
            aria-label={`Catégories ${item.name}`}
            aria-orientation="vertical"
            onKeyDown={handleTabListKeyDown}
            className="no-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3"
          >
            {categories.map((category, index) => {
              const selected = index === activeIndex

              return (
                <button
                  key={`${category.handle}-${index}`}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={tabPanelId}
                  tabIndex={selected ? 0 : -1}
                  onMouseEnter={() => setActiveSidebarIndex(index)}
                  onFocus={() => setActiveSidebarIndex(index)}
                  className={cn(
                    'group/tab focus-visible:ring-action-primary/25 relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 dark:focus-visible:ring-wisled-400/30',
                    selected
                      ? 'bg-primary text-basic-primary shadow-[0_1px_2px_rgba(15,23,42,0.06)] dark:bg-white/[0.08] dark:text-white'
                      : 'text-basic-primary/70 hover:bg-primary/65 hover:text-basic-primary dark:text-white/55 dark:hover:bg-white/[0.045] dark:hover:text-white/90'
                  )}
                  data-testid={formatNameForTestId(`sidebar-${category.name}`)}
                >
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="bg-action-primary absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full dark:bg-wisled-400"
                    />
                  )}

                  {category.image ? (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-basic-primary/[0.06] bg-secondary dark:border-white/[0.06] dark:bg-white/[0.06]">
                      <Image
                        src={category.image.url}
                        alt={category.image.alt || category.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold',
                        selected
                          ? 'bg-action-primary/10 text-action-primary dark:bg-wisled-400/10 dark:text-wisled-400'
                          : 'bg-secondary/60 text-secondary dark:bg-white/[0.05] dark:text-white/30'
                      )}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold leading-tight">
                      {category.name}
                    </span>
                    {category.category_children?.length ? (
                      <span className="mt-0.5 block text-[10px] font-medium leading-tight text-secondary dark:text-white/35">
                        {category.category_children.length} sous-catégories
                      </span>
                    ) : null}
                  </span>

                  <svg
                    aria-hidden="true"
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-all duration-200',
                      selected
                        ? 'translate-x-0 text-action-primary opacity-100 dark:text-wisled-400'
                        : '-translate-x-1 text-secondary opacity-0 group-hover/tab:translate-x-0 group-hover/tab:opacity-60'
                    )}
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
              )
            })}
          </div>

          <div className="shrink-0 border-t border-basic-primary/[0.07] p-3 dark:border-white/[0.05]">
            <LocalizedClientLink
              href={item.handle || '/shop'}
              className="group flex items-center justify-between gap-2 rounded-xl border border-basic-primary/[0.08] bg-primary px-3.5 py-2.5 text-[11.5px] font-semibold text-basic-primary/75 shadow-sm transition-all duration-200 hover:border-action-primary/25 hover:text-action-primary dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/65 dark:hover:border-wisled-400/25 dark:hover:text-wisled-400"
            >
              <span className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                Toute la boutique
              </span>
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
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
          </div>
        </div>

        {/* ── Active category content ── */}
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={activeTabId}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-basic-primary/[0.07] px-6 py-3.5 dark:border-white/[0.05] xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {activeCategory.image ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-basic-primary/[0.06] bg-secondary dark:border-white/[0.06] dark:bg-white/[0.06]">
                  <Image
                    src={activeCategory.image.url}
                    alt={activeCategory.image.alt || activeCategory.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="bg-action-primary/[0.08] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold text-action-primary dark:bg-wisled-400/10 dark:text-wisled-400">
                  {activeCategory.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div className="min-w-0">
                <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-secondary dark:text-white/35">
                  Catégorie
                </span>
                <h3 className="truncate font-sora text-[17px] font-bold leading-tight tracking-tight text-basic-primary dark:text-white">
                  {activeCategory.name}
                </h3>
              </div>

              {activeChildren.length > 0 && (
                <span
                  className="bg-action-primary/[0.08] ml-1 hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-action-primary dark:bg-wisled-400/10 dark:text-wisled-400 xl:inline-flex"
                  aria-label={childCountLabel}
                >
                  {childCountLabel}
                </span>
              )}
            </div>

            <LocalizedClientLink
              href={activeCategory.handle}
              className="hover:bg-action-primary/[0.04] group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-basic-primary/10 px-3.5 py-2 text-[11px] font-semibold text-basic-primary/70 transition-all duration-200 hover:border-action-primary/30 hover:text-action-primary dark:border-white/10 dark:text-white/55 dark:hover:border-wisled-400/30 dark:hover:bg-wisled-400/[0.06] dark:hover:text-wisled-400"
            >
              Voir tout
              <svg
                aria-hidden="true"
                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
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
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="px-5 py-5 xl:px-8 xl:py-6">
                {activeChildren.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 2xl:grid-cols-3">
                    {activeChildren.map((child, childIndex) => (
                      <LocalizedClientLink
                        key={`${child.handle}-${childIndex}`}
                        href={child.handle}
                        className="group/card focus-visible:ring-action-primary/25 flex min-h-[68px] items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-white/[0.05] dark:focus-visible:ring-wisled-400/30"
                        data-testid={formatNameForTestId(
                          `${child.name}-subcategory`
                        )}
                      >
                        {child.image ? (
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-basic-primary/[0.06] bg-secondary/60 dark:border-white/[0.06] dark:bg-white/[0.06]">
                            <Image
                              src={child.image.url}
                              alt={child.image.alt || child.name}
                              fill
                              sizes="48px"
                              loading="lazy"
                              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
                            />
                          </span>
                        ) : (
                          <span className="bg-action-primary/[0.07] flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-action-primary/60 dark:bg-wisled-400/[0.08] dark:text-wisled-400/60">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold leading-tight text-basic-primary transition-colors duration-200 group-hover/card:text-action-primary dark:text-white/85 dark:group-hover/card:text-wisled-400">
                            {child.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] font-medium text-secondary dark:text-white/35">
                            {child.category_children?.length
                              ? `${child.category_children.length} sous-catégories`
                              : 'Voir les produits'}
                          </span>
                        </span>

                        <span className="bg-action-primary/[0.08] flex h-7 w-7 shrink-0 -translate-x-1 items-center justify-center rounded-full text-action-primary opacity-0 transition-all duration-200 group-hover/card:translate-x-0 group-hover/card:opacity-100 dark:bg-wisled-400/10 dark:text-wisled-400">
                          <svg
                            aria-hidden="true"
                            className="h-3 w-3"
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
                        </span>
                      </LocalizedClientLink>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center py-2">
                    <div className="sm:grid-cols-[170px_1fr] sm:items-center grid w-full max-w-[540px] gap-5 rounded-2xl border border-basic-primary/[0.07] bg-secondary/25 p-5 dark:border-white/[0.06] dark:bg-white/[0.025]">
                      <div className="sm:aspect-square relative aspect-[4/3] overflow-hidden rounded-xl bg-wisled-950">
                        {activeCategory.image ? (
                          <Image
                            src={activeCategory.image.url}
                            alt={
                              activeCategory.image.alt || activeCategory.name
                            }
                            fill
                            sizes="170px"
                            loading="lazy"
                            className="object-cover"
                          />
                        ) : (
                          <>
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-br from-wisled-950 via-wisled-900 to-wisled-600"
                            />
                            <span
                              aria-hidden="true"
                              className="text-6xl absolute inset-0 flex items-center justify-center font-sora font-black text-white/[0.12]"
                            >
                              {activeCategory.name.charAt(0).toUpperCase()}
                            </span>
                          </>
                        )}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
                        />
                      </div>

                      <div>
                        <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-secondary dark:text-white/35">
                          Catégorie
                        </span>
                        <h4 className="mt-1 font-sora text-xl font-bold leading-tight tracking-tight text-basic-primary dark:text-white">
                          {activeCategory.name}
                        </h4>
                        <p className="mt-2 text-[12px] leading-relaxed text-secondary dark:text-white/45">
                          Parcourez la sélection de produits de cette catégorie.
                        </p>
                        <LocalizedClientLink
                          href={activeCategory.handle}
                          className="bg-action-primary hover:bg-action-primary-hover group mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-wisled-600 dark:hover:bg-wisled-500"
                        >
                          Voir les produits
                          <svg
                            aria-hidden="true"
                            className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden w-[240px] shrink-0 border-l border-basic-primary/[0.07] p-4 dark:border-white/[0.05] xl:block 2xl:w-[264px]">
              <FeaturedCategoryCard category={activeCategory} />
            </div>
          </div>

          <MegaMenuTrustBar />
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const showPanel = hasMenu && (isOpen || hasOpened)

  return (
    <div
      className="flex h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
    >
      {children({
        id: triggerId,
        'aria-haspopup': hasMenu ? 'true' : undefined,
        'aria-expanded': hasMenu ? isOpen : undefined,
        'aria-controls': hasMenu && hasOpened ? panelId : undefined,
        onKeyDown: handleTriggerKeyDown,
      })}

      {showPanel && (
        <div
          ref={menuRef}
          id={panelId}
          role="region"
          aria-label={`Menu ${item.name}`}
          aria-hidden={!isOpen}
          inert={isOpen ? undefined : true}
          onKeyDown={handlePanelKeyDown}
          className={cn(
            'absolute inset-x-0 top-full z-50 origin-top transition-all duration-300 ease-out',
            isOpen
              ? 'pointer-events-auto visible translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none invisible -translate-y-2 scale-[0.995] opacity-0'
          )}
        >
          <div className="mx-auto max-w-[1328px] px-2.5 xl:px-4">
            <div className="relative overflow-hidden rounded-b-[26px] border-x border-b border-basic-primary/[0.08] bg-primary/[0.985] shadow-[0_32px_80px_-20px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0d0f12]/[0.99] dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.65)]">
              <div
                aria-hidden="true"
                className="via-action-primary/55 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent to-transparent dark:via-wisled-500/55"
              />
              {customContent ??
                (item.category_children
                  ? renderSidebarLayout(item.category_children)
                  : null)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
