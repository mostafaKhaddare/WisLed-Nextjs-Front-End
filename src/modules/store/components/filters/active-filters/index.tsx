'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { FILTER_KEYS } from '@lib/constants'
import { useActiveFilterHandles } from '@lib/hooks/use-active-filter-handle'
import { useClearFiltersUrl } from '@lib/hooks/use-clear-filters-url'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { PRICING_OPTIONS } from '@modules/search/const'
import { ProductFilters } from 'types/global'

import ActiveFilterItem from './active-filter-item'

type ActiveProductFiltersProps = {
  filters: ProductFilters
  currentCategory?: StoreProductCategory
  currentCollection?: StoreCollection
  currentQuery?: string
  countryCode: string
}

export default function ActiveProductFilters({
  filters,
  currentCategory,
  currentCollection,
  currentQuery,
  countryCode,
}: ActiveProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Collections
  const activeCollectionIds = useActiveFilterHandles({
    key: FILTER_KEYS.COLLECTION_KEY,
  })
  const activeCollections = filters.collection?.filter((collection) => {
    return activeCollectionIds?.includes(collection.id)
  })

  // Types
  const activeTypeIds = useActiveFilterHandles({
    key: FILTER_KEYS.TYPE_KEY,
  })
  const activeTypes = filters.type?.filter((type) => {
    return activeTypeIds?.includes(type.id)
  })

  // Materials
  const activeMaterialNames = useActiveFilterHandles({
    key: FILTER_KEYS.MATERIAL_KEY,
  })
  const activeMaterials = filters.material?.filter((material) => {
    return activeMaterialNames?.includes(material.id)
  })

  // Prices
  const activePricesHandles = useActiveFilterHandles({
    key: FILTER_KEYS.PRICE_KEY,
  })
  const activePrices = PRICING_OPTIONS?.filter((price) => {
    return activePricesHandles?.includes(price.id)
  })

  // Temperature de couleur
  const activeColorTempIds = useActiveFilterHandles({
    key: FILTER_KEYS.COLOR_TEMPERATURE_KEY,
  })
  const activeColorTemps = filters.color_temperature?.filter((ct) => {
    return activeColorTempIds?.includes(ct.id)
  })

  // Puissance (Wattage)
  const activeWattageIds = useActiveFilterHandles({
    key: FILTER_KEYS.WATTAGE_KEY,
  })
  const activeWattages = filters.wattage?.filter((w) => {
    return activeWattageIds?.includes(w.id)
  })

  // Indice de protection (IP Rating)
  const activeIpRatingIds = useActiveFilterHandles({
    key: FILTER_KEYS.IP_RATING_KEY,
  })
  const activeIpRatings = filters.ip_rating?.filter((ip) => {
    return activeIpRatingIds?.includes(ip.id)
  })

  // Tension (Voltage)
  const activeVoltageIds = useActiveFilterHandles({
    key: FILTER_KEYS.VOLTAGE_KEY,
  })
  const activeVoltages = filters.voltage?.filter((v) => {
    return activeVoltageIds?.includes(v.id)
  })

  // Type de bande LED
  const activeProductTypeIds = useActiveFilterHandles({
    key: FILTER_KEYS.PRODUCT_TYPE_KEY,
  })
  const activeProductTypes = filters.product_type?.filter((pt) => {
    return activeProductTypeIds?.includes(pt.id)
  })

  const clearAllUrl = useClearFiltersUrl()

  // Preserve sortBy when clearing all filters
  const currentSortBy = searchParams.get("sortBy")
  const finalClearAllUrl = currentSortBy ? `${clearAllUrl}?sortBy=${currentSortBy}` : clearAllUrl

  const handleRemoveFilter = (key: string, id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const values = params.get(key)?.split(',') || []
    const newValues = values.filter((value) => value !== id)

    if (newValues.length > 0) {
      params.set(key, newValues.join(','))
    } else {
      params.delete(key)
    }

    const basePath = currentQuery
      ? `/${countryCode}/results/${currentQuery}`
      : currentCategory
        ? `/${countryCode}/categories/${currentCategory.handle}`
        : currentCollection
          ? `/${countryCode}/collections/${currentCollection.handle}`
          : `/${countryCode}/shop`

    // Preserve sortBy when removing other filters
    const currentSortBy = searchParams.get("sortBy")
    if (currentSortBy) {
      params.set("sortBy", currentSortBy)
    }

    router.push(
      params.toString() ? `${basePath}?${params.toString()}` : basePath
    )
  }

  const hasActiveFilters =
    activeCollections?.length > 0 ||
    activeTypes?.length > 0 ||
    activeMaterials?.length > 0 ||
    activePrices?.length > 0 ||
    activeColorTemps?.length > 0 ||
    activeWattages?.length > 0 ||
    activeIpRatings?.length > 0 ||
    activeVoltages?.length > 0 ||
    activeProductTypes?.length > 0

  if (!hasActiveFilters) {
    return null
  }

  return (
    <Box className="flex flex-wrap gap-4 gap-y-2">
      {activeCollections?.length > 0 && (
        <ActiveFilterItem
          label="Collection"
          filterKey={FILTER_KEYS.COLLECTION_KEY}
          options={activeCollections?.map((collection) => ({
            value: collection.value,
            id: collection.id,
          }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeTypes?.length > 0 && (
        <ActiveFilterItem
          label="Type"
          filterKey={FILTER_KEYS.TYPE_KEY}
          options={activeTypes}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeMaterials?.length > 0 && (
        <ActiveFilterItem
          label="Matériau"
          filterKey={FILTER_KEYS.MATERIAL_KEY}
          options={activeMaterials}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeColorTemps?.length > 0 && (
        <ActiveFilterItem
          label="Température"
          filterKey={FILTER_KEYS.COLOR_TEMPERATURE_KEY}
          options={activeColorTemps?.map((ct) => ({ value: ct.value, id: ct.id }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeWattages?.length > 0 && (
        <ActiveFilterItem
          label="Puissance"
          filterKey={FILTER_KEYS.WATTAGE_KEY}
          options={activeWattages?.map((w) => ({ value: w.value, id: w.id }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeIpRatings?.length > 0 && (
        <ActiveFilterItem
          label="IP Rating"
          filterKey={FILTER_KEYS.IP_RATING_KEY}
          options={activeIpRatings?.map((ip) => ({ value: ip.value, id: ip.id }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeVoltages?.length > 0 && (
        <ActiveFilterItem
          label="Tension"
          filterKey={FILTER_KEYS.VOLTAGE_KEY}
          options={activeVoltages?.map((v) => ({ value: v.value, id: v.id }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activeProductTypes?.length > 0 && (
        <ActiveFilterItem
          label="Type de bande"
          filterKey={FILTER_KEYS.PRODUCT_TYPE_KEY}
          options={activeProductTypes?.map((pt) => ({ value: pt.value, id: pt.id }))}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      {activePrices?.length > 0 && (
        <ActiveFilterItem
          label="Prix"
          filterKey={FILTER_KEYS.PRICE_KEY}
          options={activePrices}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
      <Button asChild variant="text" className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors underline sm:ml-auto sm:shrink-02">
        <Link href={finalClearAllUrl}>Effacer les filtres</Link>
      </Button>
    </Box>
  )
}