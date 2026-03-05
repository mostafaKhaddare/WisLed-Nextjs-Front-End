'use client'

import { Fragment, useEffect, useState } from 'react'

import { StoreProduct } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@modules/common/components/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@modules/common/components/tabs'
import { ArrowLeftIcon } from '@modules/common/icons'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import { SearchedProduct } from 'types/global'

import { ControlledSearchBox } from '../search-box'
import { RecentSearches } from '../search-dropdown/recent-searches'
import { RecommendedItem } from '../search-dropdown/recommended-item'
import { search } from '@modules/search/actions'

export const SearchDialog = ({
  isOpen,
  handleOpenDialogChange,
  countryCode,
  recommendedProducts,
}: {
  countryCode: string
  isOpen: boolean
  handleOpenDialogChange: (value: boolean) => void
  recommendedProducts: StoreProduct[]
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchedProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 0) {
        setIsLoading(true)
        setIsSearching(true)
        try {
          const { results } = await search({
            currency_code: countryCode,
            query,
            page: 1
          })
          setResults(results)
        } catch (error) {
          console.error("Search error", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsSearching(false)
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, countryCode])

  // Clear query when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setIsSearching(false)
      setResults([])
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenDialogChange}>
      <DialogPortal>
        <DialogOverlay className="z-50 bg-black/50 backdrop-blur-sm" />
        <DialogContent
          className="fixed inset-0 z-50 flex h-full w-full flex-col bg-primary outline-none !max-w-none !max-h-none !rounded-none dark:bg-[#14161b]"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex items-center gap-2 border-b border-basic-primary px-4 py-4">
            <Button
              withIcon
              variant="text"
              onClick={() => handleOpenDialogChange(false)}
              className="mr-2"
            >
              <ArrowLeftIcon />
            </Button>
            <div className="flex-1">
              <ControlledSearchBox
                countryCode={countryCode}
                open={isOpen}
                closeSearch={() => handleOpenDialogChange(false)}
                onSearch={setQuery}
              />
            </div>
          </DialogHeader>

          <VisuallyHidden.Root>
            <DialogTitle>Recherche</DialogTitle>
          </VisuallyHidden.Root>

          <DialogBody className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-transparent">
            {isSearching ? (
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-basic-primary border-t-transparent"></div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid gap-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Résultats pour "{query}"
                    </div>
                    {results.map((item) => (
                      <RecommendedItem
                        key={item.id}
                        item={item}
                        handleOpenDialogChange={handleOpenDialogChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-basic-primary/60">Aucun résultat trouvé pour "{query}"</p>
                  </div>
                )}
              </div>
            ) : (
              <Tabs defaultValue="tab1" className="h-full flex flex-col">
                <TabsList className="flex shrink-0 border-b border-basic-primary bg-primary px-4 dark:bg-[#14161b]">
                  <TabsTrigger
                    value="tab1"
                    className="flex-1 border-b-2 border-transparent py-3 text-sm font-medium text-basic-primary/60 data-[state=active]:border-action-primary data-[state=active]:text-action-primary"
                  >
                    Récent
                  </TabsTrigger>
                  <TabsTrigger
                    value="tab2"
                    className="flex-1 border-b-2 border-transparent py-3 text-sm font-medium text-basic-primary/60 data-[state=active]:border-action-primary data-[state=active]:text-action-primary"
                  >
                    Recommandés
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  className="grow p-4 outline-none"
                  value="tab1"
                >
                  <RecentSearches
                    handleOpenDialogChange={handleOpenDialogChange}
                  />
                </TabsContent>
                <TabsContent
                  className="grow p-4 outline-none"
                  value="tab2"
                >
                  <div className="grid gap-3">
                    {recommendedProducts.map((item, id) => (
                      <Fragment key={id}>
                        <RecommendedItem
                          item={item}
                          handleOpenDialogChange={handleOpenDialogChange}
                        />
                      </Fragment>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogBody>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
