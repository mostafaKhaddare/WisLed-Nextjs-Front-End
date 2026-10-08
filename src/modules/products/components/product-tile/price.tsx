import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'

export default function ProductPrice({
  calculatedPrice,
  salePrice,
}: {
  calculatedPrice: string
  salePrice?: string
}) {
  if (!calculatedPrice) {
    return null
  }

  const hasDiscount = Boolean(salePrice && salePrice !== calculatedPrice)

  return (
    <Box
      className="flex items-baseline justify-start gap-2"
      aria-label={
        hasDiscount
          ? `Prix actuel ${calculatedPrice}, ancien prix ${salePrice}`
          : `Prix ${calculatedPrice}`
      }
    >
      {hasDiscount && (
        <Text
          className="text-sm font-medium text-basic-primary/50 line-through"
          size="sm"
          aria-hidden="true"
        >
          {salePrice}
        </Text>
      )}
      <Text
        className="text-lg font-bold text-wisled-700 dark:text-wisled-200"
        size="lg"
        aria-hidden="true"
      >
        {calculatedPrice}
      </Text>
    </Box>
  )
}