'use client'

import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { Box } from '@modules/common/components/box'
import Divider from '@modules/common/components/divider'
import {
  Select,
  SelectContent,
  SelectTrigger,
} from '@modules/common/components/select'
import { PRICING_OPTIONS } from '@modules/search/const'
import { ProductFilters as ProductFiltersType } from 'types/global'
import { FILTER_KEYS } from '@lib/constants'

import FilterWrapper from './filter-wrapper'
import { FilterItems } from './filter-wrapper/filter-item'

export default function ProductFilters({
  filters,
}: {
  filters: ProductFiltersType
}) {
  const pathname = usePathname()
  const isCollection = pathname.includes('collections')
  const searchParams = useSearchParams()
  const currentPrice = searchParams.get('price')

  const collectionOptions = filters.collection.map((collection) => ({
    id: collection.id,
    value: collection.value,
  }))

  const typeOptions = filters.type.map((type) => ({
    id: type.id,
    value: type.value,
  }))

  const materialOptions = filters.material.map((material) => ({
    id: material.id,
    value: material.value,
  }))

  // New filter options for LED lighting
  const colorTemperatureOptions = filters.color_temperature?.map((ct) => ({
    id: ct.id,
    value: ct.value,
  })) ?? []

  const wattageOptions = filters.wattage?.map((w) => ({
    id: w.id,
    value: w.value,
  })) ?? []

  const ipRatingOptions = filters.ip_rating?.map((ip) => ({
    id: ip.id,
    value: ip.value,
  })) ?? []

  const voltageOptions = filters.voltage?.map((v) => ({
    id: v.id,
    value: v.value,
  })) ?? []

  const productTypeOptions = filters.product_type?.map((pt) => ({
    id: pt.id,
    value: pt.value,
  })) ?? []

  const priceOptions = PRICING_OPTIONS.map((po) => ({
    ...po,
    disabled: currentPrice !== null && currentPrice !== po.id,
  }))

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <Box className="flex flex-col gap-4 small:hidden">
        {!isCollection && (
          <>
            <FilterWrapper
              title="Collections"
              content={
                <FilterItems items={collectionOptions} param="collection" />
              }
            />
            <Divider />
          </>
        )}

        <FilterWrapper
          title="Type de produit"
          content={<FilterItems items={typeOptions} param="type" />}
        />
        <Divider />

        <FilterWrapper
          title="Matériau"
          content={<FilterItems items={materialOptions} param="material" />}
        />
        <Divider />

        {/* Temperature de couleur */}
        {colorTemperatureOptions.length > 0 && (
          <>
            <FilterWrapper
              title="Température de couleur"
              content={
                <FilterItems
                  items={colorTemperatureOptions}
                  param={FILTER_KEYS.COLOR_TEMPERATURE_KEY}
                />
              }
            />
            <Divider />
          </>
        )}

        {/* Puissance (Wattage) */}
        {wattageOptions.length > 0 && (
          <>
            <FilterWrapper
              title="Puissance (W/m)"
              content={
                <FilterItems
                  items={wattageOptions}
                  param={FILTER_KEYS.WATTAGE_KEY}
                />
              }
            />
            <Divider />
          </>
        )}

        {/* Indice de protection (IP Rating) */}
        {ipRatingOptions.length > 0 && (
          <>
            <FilterWrapper
              title="Indice de protection (IP)"
              content={
                <FilterItems
                  items={ipRatingOptions}
                  param={FILTER_KEYS.IP_RATING_KEY}
                />
              }
            />
            <Divider />
          </>
        )}

        {/* Tension (Voltage) */}
        {voltageOptions.length > 0 && (
          <>
            <FilterWrapper
              title="Tension"
              content={
                <FilterItems
                  items={voltageOptions}
                  param={FILTER_KEYS.VOLTAGE_KEY}
                />
              }
            />
            <Divider />
          </>
        )}

        {/* Type de bande LED */}
        {productTypeOptions.length > 0 && (
          <>
            <FilterWrapper
              title="Type de bande LED"
              content={
                <FilterItems
                  items={productTypeOptions}
                  param={FILTER_KEYS.PRODUCT_TYPE_KEY}
                />
              }
            />
            <Divider />
          </>
        )}

        <FilterWrapper
          title="Prix"
          content={<FilterItems items={priceOptions} param="price" />}
        />
      </Box>

      {/* Mobile Select Dropdowns */}
      <Box className="hidden items-center gap-2 small:flex flex-wrap">
        {!isCollection && collectionOptions && collectionOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir une ou plusieurs collections"
              data-testid="collection-filter"
            >
              Collections
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems items={collectionOptions} param="collection" />
            </SelectContent>
          </Select>
        )}
        {typeOptions && typeOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir un ou plusieurs types"
              data-testid="product-type-filter"
            >
              Type de produit
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems items={typeOptions} param="type" />
            </SelectContent>
          </Select>
        )}
        {materialOptions && materialOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir un ou plusieurs matériaux"
              data-testid="material-filter"
            >
              Matériau
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems items={materialOptions} param="material" />
            </SelectContent>
          </Select>
        )}
        {colorTemperatureOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir une température de couleur"
              data-testid="color-temperature-filter"
            >
              Température
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems
                items={colorTemperatureOptions}
                param={FILTER_KEYS.COLOR_TEMPERATURE_KEY}
              />
            </SelectContent>
          </Select>
        )}
        {wattageOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir une puissance"
              data-testid="wattage-filter"
            >
              Puissance
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems
                items={wattageOptions}
                param={FILTER_KEYS.WATTAGE_KEY}
              />
            </SelectContent>
          </Select>
        )}
        {ipRatingOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir un indice de protection"
              data-testid="ip-rating-filter"
            >
              IP Rating
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems
                items={ipRatingOptions}
                param={FILTER_KEYS.IP_RATING_KEY}
              />
            </SelectContent>
          </Select>
        )}
        {voltageOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir une tension"
              data-testid="voltage-filter"
            >
              Tension
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems
                items={voltageOptions}
                param={FILTER_KEYS.VOLTAGE_KEY}
              />
            </SelectContent>
          </Select>
        )}
        {productTypeOptions.length > 0 && (
          <Select value={null} onValueChange={() => { }}>
            <SelectTrigger
              aria-label="Choisir un type de bande"
              data-testid="product-type-filter"
            >
              Type de bande
            </SelectTrigger>
            <SelectContent className="w-full">
              <FilterItems
                items={productTypeOptions}
                param={FILTER_KEYS.PRODUCT_TYPE_KEY}
              />
            </SelectContent>
          </Select>
        )}
        <Select value={null} onValueChange={() => { }}>
          <SelectTrigger aria-label="Choisir un prix" data-testid="price-filter">
            Prix
          </SelectTrigger>
          <SelectContent>
            <FilterItems items={priceOptions} param="price" />
          </SelectContent>
        </Select>
      </Box>
    </>
  )
}