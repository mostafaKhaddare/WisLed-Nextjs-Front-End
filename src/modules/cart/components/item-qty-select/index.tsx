'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@lib/util/cn'

type ItemQtySelectProps = {
  qty: number
  /**
   * Highest quantity the customer may pick.
   *
   * `Infinity` means the inventory is unmanaged or backorders are allowed, so
   * Medusa will not reject a larger line and the control must not invent a
   * ceiling of its own.
   */
  maxQuantity: number
  action: (quantity: number) => void
  className?: string
}

/** Below this many options a dropdown still beats typing, so only render one
 *  when the stock figure is small enough to be useful. */
const DROPDOWN_THRESHOLD = 20

function formatLimit(maxQuantity: number): string {
  return Number.isFinite(maxQuantity)
    ? String(Math.floor(maxQuantity))
    : 'illimitée'
}

export default function ItemQtySelect({
  qty,
  maxQuantity,
  action,
  className,
}: ItemQtySelectProps) {
  const isCapped = Number.isFinite(maxQuantity)
  const upper = isCapped ? Math.max(0, Math.floor(maxQuantity)) : Infinity

  const [draft, setDraft] = useState(String(qty))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(String(qty))
  }, [qty])

  const commit = useCallback(
    (next: number) => {
      // Positive integer only — Medusa rejects anything else, so match it here.
      if (!Number.isInteger(next) || next < 1) {
        setError('La quantité doit être un nombre entier supérieur à 0.')
        return
      }
      if (next > upper) {
        setError(
          `Seulement ${formatLimit(maxQuantity)} unité(s) disponible(s).`
        )
        return
      }
      setError(null)
      action(next)
    },
    [action, maxQuantity, upper]
  )

  const step = (delta: number) => commit(qty + delta)

  const handleBlur = () => {
    const next = Number(draft.trim())
    if (draft.trim() === '' || Number.isNaN(next)) {
      setError('La quantité doit être un nombre entier supérieur à 0.')
      return
    }
    commit(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleBlur()
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      step(1)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      step(-1)
    }
  }

  const showDropdown = isCapped && upper >= 1 && upper <= DROPDOWN_THRESHOLD

  return (
    <div className={cn('flex w-max flex-col gap-1', className)}>
      <div
        className={cn(
          'inline-flex h-10 items-stretch overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base',
          'focus-within:border-ui-border-interactive',
          upper === 0 && 'pointer-events-none opacity-60'
        )}
      >
        <button
          type="button"
          aria-label="Diminuer la quantité"
          disabled={qty <= 1}
          onClick={() => step(-1)}
          className="grid w-9 place-items-center text-lg font-medium text-ui-fg-subtle transition-colors hover:bg-ui-bg-base-hover disabled:opacity-40"
        >
          −
        </button>

        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={isCapped ? upper : undefined}
          value={draft}
          aria-label="Choose quantity"
          data-testid="item-qty-select"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-14 border-x border-ui-border-base bg-transparent text-center text-md font-medium text-ui-fg-base outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          aria-label="Augmenter la quantité"
          disabled={qty >= upper}
          onClick={() => step(1)}
          className="grid w-9 place-items-center text-lg font-medium text-ui-fg-subtle transition-colors hover:bg-ui-bg-base-hover disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* A real cap gets stated; an unmanaged inventory says so rather than
          quietly implying a limit. */}
      {!error && (
        <span className="text-xs text-ui-fg-subtle">
          {isCapped ? `Max ${formatLimit(maxQuantity)}` : 'Sans limite'}
        </span>
      )}
      {error && <span className="text-xs text-negative">{error}</span>}

      {showDropdown && (
        <select
          aria-label="Quantité prédéfinie"
          value={qty}
          onChange={(event) => commit(Number(event.target.value))}
          className="mt-0.5 h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-md text-ui-fg-base outline-none"
        >
          {Array.from({ length: upper }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
