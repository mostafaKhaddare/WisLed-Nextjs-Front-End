import { listCategories } from '@lib/data/categories'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import Image from 'next/image'

export const metadata = {
  title: 'Catégories | WisLed',
  description:
    "Découvrez nos catégories d'éclairage LED pour vos projets résidentiels, commerciaux et professionnels.",
}

export default async function CategoryPage({ params }: { params: { countryCode: string } }) {
  const product_categories = await listCategories()

  const displayCategories = product_categories
    .filter((category: any) => !category.parent_category_id)
    .map((category: any) => {
      const imageArray = category.product_category_image
      const firstImageObject = Array.isArray(imageArray) ? imageArray[0] : null
      const validUrl = firstImageObject?.url || null

      return {
        id: category.id,
        title: category.name,
        handle: category.handle,
        thumbnail: validUrl,
      }
    })

  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-12 lg:py-16">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B]" aria-label="Breadcrumb">
          <LocalizedClientLink href="/" className="hover:text-[#050505] transition-colors">
            Accueil
          </LocalizedClientLink>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[#050505] font-medium">Catégories</span>
        </nav>

        <header className="mb-10 lg:mb-14 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#050505] mb-4">
            Explorez nos catégories d’éclairage LED
          </h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed">
            Découvrez nos solutions d’éclairage LED pour vos projets résidentiels, commerciaux et
            professionnels.
          </p>
        </header>

        {displayCategories.length > 0 ? (
          <section aria-label="Liste des catégories">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {displayCategories.map((category, index) => {
                const isFeatured = index === 0 || index === 1

                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className={`group relative overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#FFC400]/60 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] focus-visible:ring-offset-2 ${
                      isFeatured ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2' : ''
                    }`}
                    aria-label={`Découvrir la catégorie ${category.title}`}
                  >
                    <div
                      className={`relative w-full overflow-hidden ${
                        isFeatured ? 'aspect-[16/9] sm:aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[4/3]'
                      }`}
                    >
                      {category.thumbnail ? (
                        <Image
                          src={category.thumbnail}
                          alt={`Catégorie ${category.title} - Éclairage LED WISLED`}
                          fill
                          loading={index < 4 ? 'eager' : 'lazy'}
                          sizes={
                            isFeatured
                              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 50vw, 50vw'
                              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
                          }
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center">
                          <div className="text-center px-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                              <div className="w-6 h-6 rounded-sm bg-[#FFC400]" />
                            </div>
                            <span className="text-sm font-medium text-[#4A4A4A]">{category.title}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6">
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h2
                            className={`font-bold text-white drop-shadow-sm ${
                              isFeatured ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
                            }`}
                          >
                            {category.title}
                          </h2>
                          <p className="mt-1 text-sm text-white/90 hidden sm:block">
                            Découvrir cette catégorie
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFC400] flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform duration-300">
                          <svg className="h-5 w-5 text-[#050505]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </section>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <div className="w-8 h-8 rounded-sm bg-[#BFC3C7]" />
            </div>
            <p className="text-lg font-medium text-[#050505] mb-2">Aucune catégorie disponible</p>
            <p className="text-[#6B6B6B]">Les catégories seront affichées ici prochainement.</p>
          </div>
        )}
      </Container>
    </main>
  )
}