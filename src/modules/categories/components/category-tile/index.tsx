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
      data-testid={formatNameForTestId(`${category.title}-category-tile`)}
    >
      {/* Image container with light neutral background */}
      <Box className="relative aspect-square w-full overflow-hidden rounded-xl bg-wisled-50/80 dark:bg-wisled-950/50">
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wisled-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          aria-label={category.title}
        >
          <LoadingImage
            src={category.thumbnail}
            alt={category.title}
            loading="lazy"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
          />
        </LocalizedClientLink>
      </Box>

      {/* Category title */}
      <LocalizedClientLink
        href={`/categories/${category.handle}`}
        className="mt-3 block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wisled-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <Text
          title={category.title}
          as="span"
          className="block text-center text-sm font-medium text-basic-primary transition-colors group-hover:text-wisled-600 dark:text-white/90 dark:group-hover:text-wisled-400 small:text-base"
        >
          {category.title}
        </Text>
      </LocalizedClientLink>
    </Box>
  )
}