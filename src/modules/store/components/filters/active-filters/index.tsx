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

  const clearAllUrl = useClearFiltersUrl();

  // Preserve sortBy when clearing all filters
  const currentSortBy = searchParams.get("sortBy");
  const finalClearAllUrl = currentSortBy ? `${clearAllUrl}?sortBy=${currentSortBy}` : clearAllUrl;

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
    const currentSortBy = searchParams.get("sortBy");
    if (currentSortBy) {
      params.set("sortBy", currentSortBy);
    }

    router.push(
      params.toString() ? `${basePath}?${params.toString()}` : basePath
    );
  }

  if (
    activeCollections?.length === 0 &&
    activeTypes?.length === 0 &&
    activeMaterials?.length === 0 &&
    activePrices?.length === 0
  ) {
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
