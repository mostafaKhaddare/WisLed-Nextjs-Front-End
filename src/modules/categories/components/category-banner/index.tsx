import Image from 'next/image'

import { CategoryImage } from '.././../../../types/global'

type CategoryBannerProps = {
  images?: CategoryImage[]

  categoryName: string
}

export default function CategoryBanner({
  images,

  categoryName,
}: CategoryBannerProps) {
  // Get the first image that is not a thumbnail

  const bannerImage = images?.find((img) => img.type === 'image')

  if (!bannerImage) {
    return null
  }

  return (
    <div className="md:h-80 lg:h-96 relative mb-8 h-64 w-full overflow-hidden">
      <Image
        src={bannerImage.url}
        alt={categoryName}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  )
}
