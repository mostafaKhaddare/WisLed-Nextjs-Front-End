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
      className="flex items-center justify-start gap-2"
      aria-label={
        hasDiscount
          ? `Prix ${calculatedPrice}, prix barré ${salePrice}`
          : `Prix ${calculatedPrice}`
      }
    >
      {hasDiscount && (
        <Text
          className="order-2 text-md text-action-primary line-through"
          size="md"
          aria-hidden="true"
        >
          {salePrice}
        </Text>
      )}
      <Text
        className="order-1 text-lg font-bold text-action-primary"
        size="lg"
        aria-hidden="true"
      >
        {calculatedPrice}
      </Text>
    </Box>
  )
}
