import { StoreProduct } from '@medusajs/types'
import { SearchedProduct } from 'types/global'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import Thumbnail from '@modules/products/components/thumbnail'

export const RecommendedItem = ({
  handleOpenDialogChange,
  item,
}: {
  item: StoreProduct | SearchedProduct
  handleOpenDialogChange: (value: boolean) => void
}) => {
  return (
    <LocalizedClientLink
      href={`/products/${item.handle}`}
      onClick={() => {
        handleOpenDialogChange(false)
      }}
    >
      <Box
        className="flex w-full rounded-lg bg-primary transition-all duration-300 ease-in-out hover:bg-secondary/40 dark:bg-transparent dark:hover:bg-white/[0.04]"
        data-testid="product-row"
      >
        <div className="flex h-[90px] w-[90px] shrink-0 overflow-hidden rounded-lg">
          <Thumbnail thumbnail={item.thumbnail} size="square" alt={item.title} />
        </div>
        <Box className="px-4 pt-3 medium:flex-grow">
          <Text className="font-semibold text-basic-primary dark:text-white/90" data-testid="product-name">
            {item.title}
          </Text>
          {'variants' in item && item.variants && (
            <Text size="md" className="text-secondary dark:text-white/50">
              {item.variants[0]?.title}
            </Text>
          )}
        </Box>
      </Box>
    </LocalizedClientLink>
  )
}
