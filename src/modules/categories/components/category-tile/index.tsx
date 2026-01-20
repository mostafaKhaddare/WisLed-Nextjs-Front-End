import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

import { LoadingImage } from './loading-info'

export function CategoryTile({
  category,
}: {
  category: {
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string
  }
}) {
  return (
    <Box
      className="group flex h-full flex-col"
      data-testid={formatNameForTestId(`${category.title}-product-tile`)}
    >
      <Box className="relative aspect-square">
        <LocalizedClientLink href={`/categories/${category.handle}`}>
          <LoadingImage
            src={category.thumbnail}
            alt={category.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </LocalizedClientLink>
      </Box>
      <ProductInfo
        categoryHandle={category.handle}
        categoryTitle={category.title}
      />
    </Box>
  )
}

function ProductInfo({
  categoryHandle,
  categoryTitle,
}: {
  categoryHandle: string
  categoryTitle: string
}) {
  return (
    <Box className="flex flex-col gap-2 p-4 small:gap-6 small:p-5">
      <div className="flex flex-1 flex-col justify-between gap-4">
        <LocalizedClientLink href={`/categories/${categoryHandle}`}>
          <Text
            title={categoryTitle}
            as="span"
            className="line-clamp-2 text-center text-xl font-bold capitalize text-basic-primary"
          >
            {categoryTitle}
          </Text>
        </LocalizedClientLink>
      </div>
    </Box>
  )
}
