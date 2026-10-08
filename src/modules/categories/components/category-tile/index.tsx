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
      className="group flex h-full w-full flex-col"
      data-testid={formatNameForTestId(`${category.title}-product-tile`)}
    >
      {/* Product shot on a light neutral plate — `contain` keeps the whole
          fixture visible instead of cropping it to a square. */}
      <Box className="relative aspect-[3/2] w-full overflow-hidden rounded-t-lg  bg-category-image-tile">
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className="block h-full w-full"
        >
          <LoadingImage
            src={category.thumbnail}
            alt={category.title}
            loading="lazy"
            sizes="(min-width: 900px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="h-full w-full  transition-transform duration-500 ease-out group-hover:scale-[1.03] "
          />
        </LocalizedClientLink>
      </Box>
      <CategoryInfo
        categoryHandle={category.handle}
        categoryTitle={category.title}
      />
    </Box>
  )
}

function CategoryInfo({
  categoryHandle,
  categoryTitle,
}: {
  categoryHandle: string
  categoryTitle: string
}) {
  return (
    <LocalizedClientLink
      href={`/categories/${categoryHandle}`}
      className=" bg-primary p-1 block w-full rounded-b-lg"
    >
      <Text
        title={categoryTitle}
        as="span"
        className="block truncate text-center text-md font-medium capitalize text-basic-primary transition-colors  small:text-md"
      >
        {categoryTitle}
      </Text>
    </LocalizedClientLink>
  )
}