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

  const priceOptions = PRICING_OPTIONS.map((po) => ({
    ...po,
    disabled: currentPrice !== null && currentPrice !== po.id,
  }))

  return (
    <>
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
        <FilterWrapper
          title="Prix"
          content={<FilterItems items={priceOptions} param="price" />}
        />
      </Box>
      <Box className="hidden items-center gap-2 small:flex">
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