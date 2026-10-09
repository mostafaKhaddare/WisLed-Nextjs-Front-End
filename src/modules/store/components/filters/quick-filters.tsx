'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { FILTER_KEYS } from '@lib/constants'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { createUrl } from '@lib/util/urls'
import { omit } from 'lodash'
import { Box } from '@modules/common/components/box'
import { ProductFilters } from 'types/global'

type ChipSource = {
  id: string
  value: string
  param: string
}

function buildChips(filters: ProductFilters): ChipSource[] {
  const chips: ChipSource[] = []

  // Priority order for the quick filter bar
  const groups: Array<{ items?: { id: string; value: string }[]; param: string }> = [
    { items: filters.product_type, param: FILTER_KEYS.PRODUCT_TYPE_KEY },
    { items: filters.color_temperature, param: FILTER_KEYS.COLOR_TEMPERATURE_KEY },
    { items: filters.voltage, param: FILTER_KEYS.VOLTAGE_KEY },
    { items: filters.ip_rating, param: FILTER_KEYS.IP_RATING_KEY },
    { items: filters.wattage, param: FILTER_KEYS.WATTAGE_KEY },
  ]

  for (const group of groups) {
    if (group.items && group.items.length > 0) {
      for (const item of group.items) {
        chips.push({ id: item.id, value: item.value, param: group.param })
      }
    }
  }

  return chips
}

export default function QuickFilters({ filters }: { filters: ProductFilters }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const chips = buildChips(filters)

  if (chips.length === 0) return null

  const searchParamsObj = omit(
    Object.fromEntries(searchParams.entries()),
    'page'
  )

  return (
    <Box className="w-full px-2 pb-2">
      <Box className="flex w-full items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {chips.map((chip) => {
          const values = searchParams.get(chip.param)?.split(',') ?? []
          const checked = values.includes(chip.id)

          const newValues = checked
            ? values.filter((v) => v !== chip.id).sort().join(',')
            : [...values, chip.id].sort().join(',')

          const newSearchParamsObject = newValues.length
            ? { ...searchParamsObj, [chip.param]: newValues }
            : omit(searchParamsObj, chip.param)

          const href = createUrl(
            pathname,
            new URLSearchParams(newSearchParamsObject)
          )

          return (
            <Link
              key={`${chip.param}-${chip.id}`}
              href={href}
              data-testid={formatNameForTestId(`${chip.value}-quick-filter`)}
              className={
                checked
                  ? 'inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-wisled-500 px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-wisled-600'
                  : 'inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-border-basic-primary bg-primary px-3 text-xs font-medium text-basic-primary transition-all duration-200 hover:border-wisled-200 hover:text-wisled-600 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/80 dark:hover:border-wisled-800/40 dark:hover:text-wisled-400'
              }
            >
              {chip.value}
            </Link>
          )
        })}
      </Box>
    </Box>
  )
}