'use client'

import { useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@lib/util/cn'
import { PRICING_OPTIONS } from '@modules/search/const'
import { Button } from '@modules/common/components/button'
import { FILTER_KEYS } from '@lib/constants'
import { ProductFilters as ProductFiltersType } from 'types/global'

import { FilterItems } from './filter-wrapper/filter-item'

type Option = { id: string; value: string }

type Group = {
  /** URL param the group writes to. */
  param: string
  label: string
  items: Option[]
}

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Pertinence' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'created_at', label: 'Nouveautés' },
]

/**
 * Builds a URL that keeps the current filters but changes one param, resetting
 * pagination because a new filter set invalidates the current page number.
 */
function withParam(pathname: string, searchParams: URLSearchParams, key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString())
  params.set(key, value)
  params.delete('page')
  return `${pathname}?${params.toString()}`
}

/**
 * Builds a URL with every filter param stripped, leaving only the sort.
 */
function withAllCleared(pathname: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams()
  const sort = searchParams.get('sort_by')
  if (sort) params.set('sort_by', sort)
  return `${pathname}?${params.toString()}`
}

/**
 * Mobile filter sheet: one scrollable column of collapsible groups with a
 * sticky footer carrying the match count and an apply action.
 *
 * Everything is an anchor, so the sheet needs no client-side state to apply a
 * filter — the navigation re-runs the server query that populates the listing.
 * Only the open/closed state and which groups are expanded live in React.
 */
export default function FiltersModal({
  filters,
  count,
}: {
  filters: ProductFiltersType
  count: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [FILTER_KEYS.ORDER_BY_KEY]: true,
  })

  const sortBy = searchParams.get('sort_by') ?? 'relevance'

  // Only groups with at least one value are rendered. An empty group would
  // offer a choice that narrows the list to nothing.
  const groups = useMemo<Group[]>(() => {
    const toOptions = (list?: Option[]) =>
      (list ?? []).map((item) => ({ id: item.id, value: item.value }))

    const all = [
      ...(pathname?.includes('collections')
        ? []
        : [
            {
              param: 'collection',
              label: 'Collection',
              items: toOptions(filters.collection),
            },
          ]),
      {
        param: 'type',
        label: 'Type de produit',
        items: toOptions(filters.type),
      },
      {
        param: 'material',
        label: 'Matériau',
        items: toOptions(filters.material),
      },
      {
        param: FILTER_KEYS.PRODUCT_TYPE_KEY,
        label: 'Type de bande LED',
        items: toOptions(filters.product_type),
      },
      {
        param: FILTER_KEYS.COLOR_TEMPERATURE_KEY,
        label: 'Température de couleur',
        items: toOptions(filters.color_temperature),
      },
      {
        param: FILTER_KEYS.WATTAGE_KEY,
        label: 'Puissance (W/m)',
        items: toOptions(filters.wattage),
      },
      {
        param: FILTER_KEYS.IP_RATING_KEY,
        label: 'Indice de protection (IP)',
        items: toOptions(filters.ip_rating),
      },
      {
        param: FILTER_KEYS.VOLTAGE_KEY,
        label: 'Tension',
        items: toOptions(filters.voltage),
      },
      {
        param: FILTER_KEYS.STRIP_WIDTH_KEY,
        label: 'Largeur de ruban (mm)',
        items: toOptions(filters.strip_width),
      },
      {
        param: FILTER_KEYS.PROFILE_KEY,
        label: 'Profil / diffuseur',
        items: toOptions(filters.profile),
      },
      {
        param: 'price',
        label: 'Prix',
        items: PRICING_OPTIONS.map((po) => ({ id: po.id, value: po.value })),
      },
    ]

    return all.filter((group) => group.items.length > 0)
  }, [filters, pathname])

  const toggle = (param: string) =>
    setExpanded((prev) => ({ ...prev, [param]: !prev[param] }))

  const activeCount = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total + (searchParams.getAll(group.param).length > 0 ? 1 : 0),
        0
      ),
    [groups, searchParams]
  )

  return (
    <>
      <Button
        size="sm"
        variant="filled"
        className="flex !py-2 small:hidden"
        onClick={() => setOpen(true)}
        data-testid="filters-open"
      >
        Filtres
        {activeCount > 0 && (
          <span className="ml-1 rounded-full bg-white/25 px-1.5 text-xs">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40 sm:hidden">
          <button
            aria-label="Fermer les filtres"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            className="relative mt-auto flex max-h-[88vh] flex-col rounded-t-3xl bg-white dark:bg-[#0F1B33]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0F2F8] px-4 py-4 dark:border-white/10">
              <h2 className="font-sora text-lg font-bold text-[#0F1B33] dark:text-white">
                Filtres
              </h2>
              <a
                href={withAllCleared(pathname ?? '/', searchParams)}
                className={cn(
                  'font-jakarta text-sm font-semibold text-[#1D4ED8]',
                  activeCount === 0 && 'pointer-events-none opacity-40'
                )}
                data-testid="filters-clearAll"
              >
                Tout effacer
              </a>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4">
              <Group
                label="Trier par"
                param={FILTER_KEYS.ORDER_BY_KEY}
                expanded={!!expanded[FILTER_KEYS.ORDER_BY_KEY]}
                onToggle={() => toggle(FILTER_KEYS.ORDER_BY_KEY)}
              >
                <div className="flex flex-col gap-1 pb-3">
                  {SORT_OPTIONS.map((option) => (
                    <a
                      key={option.id}
                      href={withParam(
                        pathname ?? '/',
                        searchParams,
                        FILTER_KEYS.ORDER_BY_KEY,
                        option.id
                      )}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3 py-2.5 font-jakarta text-sm transition-colors',
                        sortBy === option.id
                          ? 'bg-[#0F1B33] font-semibold text-white'
                          : 'text-[#0F1B33] dark:text-white'
                      )}
                    >
                      {option.label}
                      {sortBy === option.id && <span aria-hidden="true">✓</span>}
                    </a>
                  ))}
                </div>
              </Group>

              {groups.map((group) => (
                <Group
                  key={group.param}
                  label={group.label}
                  param={group.param}
                  expanded={!!expanded[group.param]}
                  onToggle={() => toggle(group.param)}
                >
                  <FilterItems items={group.items} param={group.param} />
                </Group>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[#F0F2F8] p-4 dark:border-white/10">
              <Button
                className="!h-12 w-full !rounded-3xl !bg-[#1D4ED8] !font-jakarta !text-[15px] !font-bold !text-white"
                onClick={() => setOpen(false)}
                data-testid="filters-seeProducts"
              >
                Voir les produits ({count})
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** One collapsible filter group with a chevron header. */
function Group({
  label,
  expanded,
  onToggle,
  children,
  param,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  param: string
}) {
  return (
    <div className="border-b border-[#F0F2F8] last:border-b-0 dark:border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`filter-group-${param}`}
        className="flex w-full items-center justify-between py-3.5 text-left"
      >
        <span className="font-jakarta text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B6577] dark:text-gray-400">
          {label}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className={cn(
            'h-4 w-4 text-[#5B6577] transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expanded && (
        <div id={`filter-group-${param}`} className="pb-3">
          {children}
        </div>
      )}
    </div>
  )
}
