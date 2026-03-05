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
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-basic-primary/[0.12] shadow-lg bg-primary transition-all duration-300 hover:border-basic-primary/[0.12] hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:shadow-xl dark:hover:shadow-black/20"
      data-testid={formatNameForTestId(`${category.title}-product-tile`)}
    >
      <Box className="relative aspect-square overflow-hidden">
        <LocalizedClientLink href={`/categories/${category.handle}`}>
          <LoadingImage
            src={category.thumbnail}
            alt={category.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
    <Box className="flex flex-col gap-2 p-3 small:gap-3 small:p-4">
      <div className="flex flex-1 flex-col justify-between gap-4">
        <LocalizedClientLink href={`/categories/${categoryHandle}`}>
          <Text
            title={categoryTitle}
            as="span"
            className="line-clamp-2 text-center text-lg font-bold capitalize text-basic-primary transition-colors group-hover:text-action-primary dark:text-white/90 dark:group-hover:text-brand-400 small:text-xl"
          >
            {categoryTitle}
          </Text>
        </LocalizedClientLink>
      </div>
    </Box>
  )
}
