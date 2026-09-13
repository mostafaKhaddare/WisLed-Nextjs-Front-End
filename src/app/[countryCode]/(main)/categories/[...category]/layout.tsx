import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCategoryByHandle, listCategories } from '@lib/data/categories'
import { listRegions } from '@lib/data/regions'
import { StoreProductCategory, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

interface CategoryPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ category: string[] }>
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories().catch(() => [])

    if (!product_categories?.length) {
      return []
    }

    const countryCodes = await listRegions()
      .then((regions: StoreRegion[]) =>
        regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
      )
      .catch(() => [])

    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        categoryHandles.map((handle: any) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams ?? []
  } catch {
    return []
  }
}

export async function generateMetadata(
  props: CategoryPageLayoutProps
): Promise<Metadata> {
  const params = await props.params
  try {
    const { product_categories } = await getCategoryByHandle(params.category)

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(' | ')

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} category.`

    return {
      title: `${title} | WisLed Shop`,
      description,
      alternates: {
        canonical: `${params.category.join('/')}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPageLayout(
  props: CategoryPageLayoutProps
) {
  const params = await props.params

  const { category } = await params

  const { children } = props

  const { product_categories } = await getCategoryByHandle(category)
  const currentCategory = product_categories?.[product_categories.length - 1]

  if (!currentCategory) {
    notFound()
  }

  return (
    <>
      <Container className="flex flex-col gap-2 !pt-6 !pb-1">
        <Box className="flex flex-col border-b border-gray-200 gap-3">
          <StoreBreadcrumbs breadcrumb={currentCategory.name} />
          <Heading
            as="h1"
            className="text-3xl text-basic-primary small:text-5xl pb-4"
          >
            {currentCategory.name}
          </Heading>
        </Box>
      </Container>
      {children}
    </>
  )
}
