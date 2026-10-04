import repeat from '@lib/util/repeat'
import { Container } from '@modules/common/components/container'
import SkeletonCategoryPreview from '@modules/skeletons/components/skeleton-product-preview'

const SkeletonCategoriesCarousel = () => {
  return (
    <Container className="flex flex-col gap-10">
      <div className="h-12 w-[250px] animate-pulse bg-skeleton-primary" />
      <ul
        className="grid w-full grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 small:gap-x-6 small:gap-y-10 large:grid-cols-4"
        data-testid="products-list"
      >
        {repeat(8).map((index) => (
          <li key={index}>
            <SkeletonCategoryPreview />
          </li>
        ))}
      </ul>
    </Container>
  )
}

export default SkeletonCategoriesCarousel
