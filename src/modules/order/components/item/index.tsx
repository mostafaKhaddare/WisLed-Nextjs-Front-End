import { HttpTypes } from '@medusajs/types'
import { Text } from '@medusajs/ui'
import { Box } from '@modules/common/components/box'
import LineItemPrice from '@modules/common/components/line-item-price'
import Thumbnail from '@modules/products/components/thumbnail'

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const Item = ({ item }: ItemProps) => {
  const variantTitle =
    (item as HttpTypes.StoreOrderLineItem & {
      variant_title?: string
    }).variant_title ||
    (item as HttpTypes.StoreCartLineItem & { variant?: { title?: string } })
      .variant?.title

  return (
    <Box className="flex w-full bg-primary p-4" data-testid="product-row">
      <div className="flex h-[90px] w-[90px] shrink-0">
        <Thumbnail thumbnail={item.thumbnail} size="square" alt={item.product_title} />
      </div>
      <Box className="px-4 medium:flex-grow">
        <Text size="base" className="text-secondary">
          {item.product_collection}
        </Text>
        <Text className="font-medium" data-testid="product-name">
          {item.product_title}
        </Text>
        {variantTitle && (
          <Text size="base" className="text-secondary">
            {variantTitle}
          </Text>
        )}
        <Text size="base" className="mt-1 text-secondary">
          Quantité : {item.quantity}
        </Text>
        <LineItemPrice
          item={item}
          style="tight"
          className="mt-3 flex-col items-start gap-0 medium:hidden"
        />
      </Box>
      <Box className="flex items-center justify-center">
        <LineItemPrice
          item={item}
          style="tight"
          className="hidden flex-col items-start gap-0 medium:block"
        />
      </Box>
    </Box>
  )
}

export default Item
