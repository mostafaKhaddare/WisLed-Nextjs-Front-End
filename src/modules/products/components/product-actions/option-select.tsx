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
import { Box } from '@modules/common/components/box'

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  variantsColors: VariantColor[]
  title: string
  disabled: boolean
  'data-testid'?: string
}

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

  return (
    <div className="flex flex-col gap-y-3">
      <Text as="p" className="text-md flex justify-between">
        <Box className="flex gap-x-2">
          <Text as="span" className="text-secondary">
            {title}:
          </Text>{' '}
          <Text as="span" className="text-basic-primary">
            {current}
          </Text>
        </Box>

        {/* Show Guide Link if title suggests Color Temperature */}
        {(title.toLowerCase().includes('color') || title.toLowerCase().includes('couleur') || title.toLowerCase().includes('kelvin') || title.toLowerCase().includes('temp')) && (
          <>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="ml-2 inline-flex items-center gap-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <InformationCircleSolid className="w-4 h-4" />
              <span>Guide des couleurs ?</span>
            </button>
            <ColorGuideModal isOpen={isGuideOpen} close={() => setIsGuideOpen(false)} />
          </>
        )}

        {/* Show Power Calculator Link if title is Voltage */}
        {title.toLowerCase() === 'voltage' && (
          <>
            <button
              onClick={() => setIsCalcOpen(true)}
              className="ml-2 text-xs text-blue-600 hover:underline cursor-pointer flex items-center"
            >
              <span className="mr-1">⚡</span> Power Calculator
            </button>
            <PowerCalculatorModal isOpen={isCalcOpen} close={() => setIsCalcOpen(false)} />
          </>
        )}
      </Text>


      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions?.map((v) => {
          const color = getVariantColor(v, variantsColors)
          const image = color?.Image
          const hex = color?.Color

          // Render image/color variant if exists
          if (image || hex) {
            return image ? (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn('border-primary h-12 w-12 border', {
                  'border-action-primary': v === current,
                })}
                aria-label="Choose variant color"
                disabled={disabled}
                data-testid="option-button"
              >
                <Image
                  src={process.env.NEXT_PUBLIC_STRAPI_URL + image.url}
                  alt={image.alternativeText ?? 'Variant color'}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn('border-primary h-12 w-12 border', {
                  'border-action-primary': v === current,
                })}
                aria-label="Choose variant color"
                style={{ backgroundColor: hex }}
                disabled={disabled}
                data-testid="option-button"
              />
            )
          }

          // Render plain button for non-color variants (like 12V / 24V)
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={cn(
                'h-12 min-w-[48px] rounded border px-3 text-sm font-medium',
                {
                  'border-action-primary': v === current,
                }
              )}
              aria-label={`Choose ${v}`}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div >
  )
}

export default OptionSelect
