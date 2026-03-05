import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <Box className="flex flex-col gap-y-4">
      <Box className="flex flex-col gap-y-1" id="product-info">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-max text-md text-secondary"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          as="h1"
          className="text-2xl font-bold text-basic-primary small:text-3xl"
          data-testid="product-title"
        >
          {product.title}
        </Heading>
        {product.subtitle && (
          <Text
            as="p"
            className="text-sm font-medium text-secondary"
            data-testid="product-subtitle"
          >
            {product.subtitle}
          </Text>
        )}
      </Box>

      {/* Short description — shown directly under title for instant persuasion */}
      {product.description && (
        <Text
          as="p"
          className="text-sm leading-relaxed text-basic-primary/70 dark:text-white/60 line-clamp-4"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </Box>
  )
}

export default ProductInfo
