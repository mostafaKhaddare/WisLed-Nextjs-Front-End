import React from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { getVariantColor } from '@lib/util/get-variant-color'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@modules/common/components/text'
import { VariantColor } from 'types/strapi'
import { InformationCircleSolid } from '@medusajs/icons'
import ColorGuideModal from '../color-guide-modal'
import PowerCalculatorModal from '../power-calculator-modal'

import { HAIRLINE, MUTED, NAVY } from '../product-tile/design-tokens'

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  variantsColors: VariantColor[]
  title: string
  disabled: boolean
  'data-testid'?: string
}

/**
 * Pill geometry straight from the mock: 48px tall, 24px radius, hairline
 * border, a 16px swatch disc and the value label in 14px/600.
 *
 * Colours are applied inline rather than through arbitrary Tailwind values so
 * they stay runtime data — Tailwind has to see class names statically.
 */
const PILL_BASE = `
  relative inline-flex h-12 shrink-0 items-center gap-2 rounded-3xl
  border-[1.6px] pl-[18px] pr-5 font-jakarta text-sm font-semibold leading-none
  transition-colors duration-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]
  focus-visible:ring-offset-2 focus-visible:ring-offset-white
  disabled:pointer-events-none disabled:opacity-50
`

// Border colours are set inline (they depend on selection state), so hover
// feedback is limited to the fill, which inline styles do not override.
const PILL_IDLE = 'bg-white text-[#0F1B33] hover:bg-[#F1F3F9]'
const PILL_ACTIVE = 'bg-[#0F1B33] text-white hover:bg-[#1B2B4E]'

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  variantsColors,
  title,
  'data-testid': dataTestId,
  disabled,
}) => {
  const [isGuideOpen, setIsGuideOpen] = React.useState(false)
  const [isCalcOpen, setIsCalcOpen] = React.useState(false)

  const filteredOptions = option.values
    ?.sort((a, b) => a.value.localeCompare(b.value))
    .map((v) => v.value)

  // The colour guide only makes sense for options that describe light colour.
  const isColorInfo =
    title.toLowerCase().includes('color') ||
    title.toLowerCase().includes('couleur') ||
    title.toLowerCase().includes('kelvin') ||
    title.toLowerCase().includes('temp')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <Text as="p" className="font-jakarta text-sm" style={{ color: MUTED }}>
          <span className="font-semibold text-[#0F1B33]">{title}</span>
          {current && <span className="ml-1.5">· {current}</span>}
        </Text>

        {/* Colour information stays on the right, per the mock. */}
        {isColorInfo && (
          <>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 rounded-full font-jakarta text-xs font-semibold text-[#1D4ED8] transition-colors hover:text-[#183CA9] hover:underline"
            >
              <InformationCircleSolid className="h-4 w-4" />
              <span>Guide des couleurs ?</span>
            </button>
            <ColorGuideModal
              isOpen={isGuideOpen}
              close={() => setIsGuideOpen(false)}
            />
          </>
        )}

        {title.toLowerCase() === 'voltage' && (
          <>
            <button
              onClick={() => setIsCalcOpen(true)}
              className="inline-flex items-center gap-1 rounded-full font-jakarta text-xs font-semibold text-[#1D4ED8] transition-colors hover:text-[#183CA9] hover:underline"
            >
              <span aria-hidden="true">⚡</span> Power Calculator
            </button>
            <PowerCalculatorModal
              isOpen={isCalcOpen}
              close={() => setIsCalcOpen(false)}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions?.map((v) => {
          const color = getVariantColor(v, variantsColors)
          const image = color?.Image
          const hex = color?.Color
          const isActive = v === current

          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={cn(PILL_BASE, isActive ? PILL_ACTIVE : PILL_IDLE)}
              style={{ borderColor: isActive ? NAVY : HAIRLINE }}
              aria-label={`Choose ${v}`}
              aria-pressed={isActive}
              disabled={disabled}
              data-testid="option-button"
            >
              {/* Swatch disc — an image when the CMS supplies one, else the
                  stored hex, else omitted for plain values like 12V / 24V. */}
              {image ? (
                <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                  <Image
                    src={image.url}
                    alt=""
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </span>
              ) : hex ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: hex }}
                />
              ) : null}

              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
