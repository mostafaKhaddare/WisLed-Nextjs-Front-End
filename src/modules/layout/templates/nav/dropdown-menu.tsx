'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

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

interface DropdownMenuProps {
  item: CategoryItem
  activeItem: {
    name: string
    handle: string
  }
  children: React.ReactNode
  customContent?: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/* ------------------------------------------------------------------ */
/*  Sidebar + Content Mega Menu                                        */
/* ------------------------------------------------------------------ */

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  item,
  activeItem,
  children,
  customContent,
  isOpen,
  onOpenChange,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!isOpen && (item.category_children || customContent)) {
      onOpenChange(true)
    }
  }, [isOpen, item.category_children, customContent, onOpenChange])

  const handleMouseLeave = useCallback(() => {
    if (isOpen) {
      timeoutRef.current = setTimeout(() => {
        onOpenChange(false)
      }, 280)
    }
  }, [isOpen, onOpenChange])

  const toggle = useCallback(() => {
    if (!item.category_children) return
    onOpenChange(!isOpen)
  }, [isOpen, item.category_children, onOpenChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!item.category_children) return
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          toggle()
          if (!isOpen) {
            setTimeout(() => {
              const firstLink = menuRef.current?.querySelector('a, button') as HTMLElement
              firstLink?.focus()
            }, 150)
          }
          break
        case 'ArrowDown':
          if (!isOpen) {
            e.preventDefault()
            onOpenChange(true)
            setTimeout(() => {
              const firstLink = menuRef.current?.querySelector('a, button') as HTMLElement
              firstLink?.focus()
            }, 150)
          }
          break
        case 'Escape':
          if (isOpen) {
            e.preventDefault()
            onOpenChange(false)
            triggerRef.current?.focus()
          }
          break
      }
    },
    [isOpen, item.category_children, onOpenChange, toggle]
  )

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onOpenChange(false)
        triggerRef.current?.focus()
      }
      if (e.key === 'Tab') {
        requestAnimationFrame(() => {
          if (
            menuRef.current &&
            !menuRef.current.contains(document.activeElement) &&
            !triggerRef.current?.contains(document.activeElement)
          ) {
            onOpenChange(false)
          }
        })
      }
    },
    [onOpenChange]
  )

  /* ---------------------------------------------------------------- */
  /*  Sidebar + Grid Layout (for "Shop" dropdown)                      */
  /* ---------------------------------------------------------------- */
  const renderSidebarLayout = (categories: CategoryItem[]) => {
    const activeCategory = categories[activeSidebarIndex]
    const activeChildren = activeCategory?.category_children ?? []

    return (
      <div className="flex" style={{ maxHeight: 'min(560px, 78vh)' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className="flex w-[240px] xl:w-[260px] shrink-0 flex-col border-r border-basic-primary/[0.07] bg-gradient-to-b from-secondary/40 to-secondary/20 dark:border-white/[0.05] dark:from-white/[0.025] dark:to-transparent min-h-0">

          {/* Sidebar header */}
          <div className="flex items-center gap-2 border-b border-basic-primary/[0.07] px-6 py-4 dark:border-white/[0.05] shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-action-primary dark:bg-brand-400" />
            <span className="text-[10.5px] font-black uppercase tracking-[0.22em] text-secondary dark:text-white/40">
              Catégories
            </span>
          </div>

          {/* Parent category list — scrollable */}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3 min-h-0">
            {categories.map((cat, index) => (
              <button
                key={index}
                type="button"
                onMouseEnter={() => setActiveSidebarIndex(index)}
                onFocus={() => setActiveSidebarIndex(index)}
                className={cn(
                  'group/sb relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold tracking-wide transition-all duration-200',
                  index === activeSidebarIndex
                    ? 'bg-primary text-action-primary shadow-sm dark:bg-white/[0.09] dark:text-brand-400'
                    : 'text-basic-primary/75 hover:bg-primary/70 hover:text-basic-primary dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white/90'
                )}
                data-testid={formatNameForTestId(`sidebar-${cat.name}`)}
              >
                {/* Active indicator strip */}
                {index === activeSidebarIndex && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-action-primary dark:bg-brand-400" />
                )}

                {/* Category thumbnail */}
                {cat.image ? (
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-secondary dark:bg-white/[0.08]">
                    <Image
                      src={cat.image.url}
                      alt={cat.image.alt || cat.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  /* Colored initial avatar fallback */
                  <span className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-black',
                    index === activeSidebarIndex
                      ? 'bg-action-primary/10 text-action-primary dark:bg-brand-400/10 dark:text-brand-400'
                      : 'bg-secondary/60 text-secondary dark:bg-white/[0.05] dark:text-white/30'
                  )}>
                    {cat.name.charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="flex-1 truncate">{cat.name}</span>

                {/* Chevron arrow */}
                <svg
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-all duration-200',
                    index === activeSidebarIndex
                      ? 'text-action-primary opacity-100 dark:text-brand-400'
                      : 'text-secondary opacity-0 group-hover/sb:opacity-60'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </nav>

          {/* Sidebar footer — "Shop all" CTA */}
          <div className="border-t border-basic-primary/[0.07] px-4 py-4 dark:border-white/[0.05]">
            <LocalizedClientLink
              href={activeItem?.handle ?? '/shop'}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-black/80 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Voir la boutique
              <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </LocalizedClientLink>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">

          {/* Content header */}
          <div className="flex items-center justify-between border-b border-basic-primary/[0.07] px-8 py-4 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              {activeCategory?.image && (
                <span className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image
                    src={activeCategory.image.url}
                    alt={activeCategory.image.alt || activeCategory.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              )}
              <h3 className="text-lg font-bold tracking-tight text-basic-primary dark:text-white">
                {activeCategory?.name}
              </h3>
              {activeChildren.length > 0 && (
                <span className="rounded-full bg-action-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-action-primary dark:bg-brand-400/10 dark:text-brand-400">
                  {activeChildren.length}
                </span>
              )}
            </div>
            <LocalizedClientLink
              href={activeCategory?.handle ?? '/shop'}
              className="group inline-flex items-center gap-1.5 rounded-full border border-basic-primary/10 px-4 py-1.5 text-xs font-bold text-basic-primary/70 transition-all duration-200 hover:border-action-primary/30 hover:bg-action-primary/5 hover:text-action-primary dark:border-white/10 dark:text-white/50 dark:hover:border-brand-400/30 dark:hover:text-brand-400"
            >
              Voir tout
              <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </LocalizedClientLink>
          </div>

          {/* Subcategory grid */}
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            {activeChildren.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {activeChildren.map((child, childIndex) => (
                  <LocalizedClientLink
                    key={childIndex}
                    href={child.handle}
                    className="group/card relative flex items-center gap-4 overflow-hidden rounded-2xl border border-basic-primary/[0.07] bg-secondary/20 p-3 transition-all duration-250 hover:border-action-primary/20 hover:bg-secondary/50 hover:shadow-lg dark:border-white/[0.05] dark:bg-white/[0.025] dark:hover:border-brand-400/20 dark:hover:bg-white/[0.06]"
                    data-testid={formatNameForTestId(`${child.name}-subcategory`)}
                  >
                    {/* Sub-category image */}
                    {child.image ? (
                      <Box className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl bg-secondary/60 dark:bg-white/[0.06]">
                        <Image
                          src={child.image.url}
                          alt={child.image.alt || child.name}
                          fill
                          sizes="60px"
                          loading="lazy"
                          className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
                        />
                        {/* Subtle gradient overlay on image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                      </Box>
                    ) : (
                      /* No image fallback */
                      <Box className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-action-primary/8 dark:bg-brand-400/8">
                        <svg className="h-6 w-6 text-action-primary/40 dark:text-brand-400/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                        </svg>
                      </Box>
                    )}

                    {/* Text */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13px] font-semibold leading-snug text-basic-primary transition-colors duration-200 group-hover/card:text-action-primary dark:text-white/85 dark:group-hover/card:text-brand-400">
                        {child.name}
                      </span>
                      {child.category_children && child.category_children.length > 0 && (
                        <span className="text-[11px] text-secondary dark:text-white/35">
                          {child.category_children.length} articles
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <svg
                      className="ml-auto h-4 w-4 shrink-0 text-secondary opacity-0 transition-all duration-200 group-hover/card:translate-x-0 group-hover/card:text-action-primary group-hover/card:opacity-100 dark:group-hover/card:text-brand-400 -translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </LocalizedClientLink>
                ))}
              </div>
            ) : (
              /* No sub-categories */
              <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
                {activeCategory?.image && (
                  <Box className="relative h-36 w-52 overflow-hidden rounded-2xl bg-secondary/40 shadow-md dark:bg-white/[0.06]">
                    <Image
                      src={activeCategory.image.url}
                      alt={activeCategory.image.alt || activeCategory.name}
                      fill
                      sizes="208px"
                      loading="lazy"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </Box>
                )}
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-basic-primary dark:text-white/90">
                    {activeCategory?.name}
                  </p>
                  <p className="text-xs text-secondary dark:text-white/40">
                    Explorez tous nos produits dans cette catégorie
                  </p>
                </div>
                <LocalizedClientLink
                  href={activeCategory?.handle ?? '/shop'}
                  className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action-primary-hover hover:shadow-md dark:bg-brand-600 dark:hover:bg-brand-500"
                >
                  Voir {activeCategory?.name}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </LocalizedClientLink>
              </div>
            )}
          </div>

          {/* Bottom trust-badge promo bar */}
          <div className="border-t border-basic-primary/[0.07] bg-secondary/10 px-8 py-3 dark:border-white/[0.05] dark:bg-white/[0.015]">
            <div className="flex items-center gap-8">
              {/* Badge 1: Delivery */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                  <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-basic-primary dark:text-white/80">Livraison nationale</span>
                  <span className="text-[10px] text-secondary dark:text-white/40">Partout au Maroc</span>
                </div>
              </div>

              <div className="h-7 w-px bg-basic-primary/[0.07] dark:bg-white/[0.06]" />

              {/* Badge 2: Payment */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-basic-primary dark:text-white/80">Paiement à la livraison</span>
                  <span className="text-[10px] text-secondary dark:text-white/40">Disponible selon la ville</span>
                </div>
              </div>

              <div className="h-7 w-px bg-basic-primary/[0.07] dark:bg-white/[0.06]" />

              {/* Badge 3: Return */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <svg className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-basic-primary dark:text-white/80">Retour 7 jours</span>
                  <span className="text-[10px] text-secondary dark:text-white/40">Satisfait ou remboursé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="flex h-full"
      role="none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        role="menuitem"
        tabIndex={0}
        aria-haspopup={item.category_children ? 'true' : undefined}
        aria-expanded={item.category_children ? isOpen : undefined}
        aria-controls={item.category_children ? `dropdown-${item.name}` : undefined}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Dropdown Panel */}
      {item.category_children && hasOpened && (
        <div
          ref={menuRef}
          id={`dropdown-${item.name}`}
          role="menu"
          aria-label={`${item.name} submenu`}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute left-0 top-full z-50 w-full transition-all duration-300 ease-out',
            isOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none invisible -translate-y-2 opacity-0'
          )}
        >
          {/* Panel container */}
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-b-2xl border-x border-b border-basic-primary/[0.08] bg-primary/[0.98] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0d0f12]/[0.99] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
            {/* Top accent line */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-action-primary/60 to-transparent dark:via-brand-500/60" />
            {customContent ?? renderSidebarLayout(item.category_children)}
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownMenu