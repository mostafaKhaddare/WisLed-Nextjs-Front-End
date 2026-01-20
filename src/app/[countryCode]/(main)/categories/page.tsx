import { listCategories } from '@lib/data/categories'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
// import LoadingImage from '@modules/common/components/loading-image'
import Image from 'next/image'
export default async function CategoryPage() {
  const product_categories = await listCategories()

  // --- DATA TRANSFORMATION LOGIC ---
  const displayCategories = product_categories
    // 1. Filter: Only show "Root" categories (those with no parent)
    .filter((category: any) => !category.parent_category_id)
    // 2. Map: Extract the correct image URL from the object structure
    .map((category: any) => {
      // Access the array seen in your screenshot
      const imageArray = category.product_category_image
      
      // Get the first object from the array, if it exists
      const firstImageObject = Array.isArray(imageArray) ? imageArray[0] : null
      
      // Get the URL (fallback to null if missing)
      const validUrl = firstImageObject?.url || null

      return {
        id: category.id,
        title: category.name, // Map 'name' to 'title'
        handle: category.handle,
        thumbnail: validUrl, // This is the string URL we need
      }
    })

  // --- RENDER ---
  return (
    <Container className="py-12 md:py-24">
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col gap-4">
          <Text className="text-3xl font-bold text-ui-fg-base">Shop</Text>
          <Text className="text-lg text-ui-fg-subtle">
            Découvrez nos catégories d’éclairage professionnel.S
          </Text>
        </div>

        {displayCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-6 gap-y-8">
            {displayCategories.map((category) => (
              <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="group flex flex-col gap-3"
              >
              {/* Image Container */}
              <div className="relative aspect-[3/4] md:aspect-[4/4] w-full overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                {category.thumbnail ? (
                <Image
                  src={category.thumbnail}
                  alt={category.title}
                  loading="lazy"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
                )}
              </div>

              {/* Category Title */}
              <Text className="text-base font-medium text-ui-fg-base group-hover:text-ui-fg-interactive transition-colors">
                {category.title}
              </Text>
              </LocalizedClientLink>
            ))}
            </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            <p>No collections found with images.</p>
          </div>
        )}
      </div>
    </Container>
  )
}