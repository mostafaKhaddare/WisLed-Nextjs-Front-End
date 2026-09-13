'use client'

import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { XMarkMini } from '@medusajs/icons'
import { Box } from '@modules/common/components/box'
import { Input } from '@modules/common/components/input'

export const ControlledSearchBox = ({
  countryCode,
  open,
  closeSearch,
  onSearch,
}: {
  countryCode: string
  open: boolean
  closeSearch: () => void
  onSearch?: (query: string) => void
}) => {
  const [query, setQuery] = useState<string | undefined>('')
  const router = useRouter()
  const inputRef = useRef(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (query) {
      const localSearches =
        JSON.parse(localStorage.getItem('recentSearches')) || []

      const updatedSearches = new Set([query, ...localSearches])

      localStorage.setItem(
        'recentSearches',
        JSON.stringify(Array.from(updatedSearches).slice(0, 5))
      )
      router.push(`/${countryCode}/results/${query}`)
    }
    inputRef.current.blur()
    setQuery('')
    closeSearch()
  }

  const handleReset = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (inputRef.current && open) {
      inputRef.current.focus()
    }
  }, [open])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (onSearch) {
      onSearch(val)
    }
  }

  return (
    <div className="relative w-full bg-primary large:mx-auto large:w-max">
      <form action="" noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <Box className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-secondary/30 px-2 transition-all duration-300 focus-within:border-action-primary/20 focus-within:bg-white focus-within:shadow-lg dark:bg-white/5 dark:focus-within:border-brand-400/30 dark:focus-within:bg-[#1a1d24] large:w-[280px] xl:w-[320px]">
          <Input
            ref={inputRef}
            data-testid="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Rechercher..."
            aria-label="Rechercher un produit"
            spellCheck={false}
            type="search"
            value={query}
            onChange={handleChange}
            className="w-full !border-none bg-transparent py-2.5 text-sm font-medium placeholder:text-secondary/70 focus:outline-none dark:text-white dark:placeholder:text-white/40"
          />
          {query && (
            <button
              onClick={handleReset}
              type="button"
              className="group flex shrink-0 items-center justify-center rounded-full p-1.5 transition-colors hover:bg-secondary/50 dark:hover:bg-white/10"
            >
              <XMarkMini className="text-secondary transition-colors group-hover:text-action-primary dark:text-white/60 dark:group-hover:text-white" />
            </button>
          )}
        </Box>
      </form>
    </div>
  )
}
