import { Metadata } from 'next'

import { getFAQ } from '@lib/data/fetch'
import { FAQSection } from 'types/strapi'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { FAQAccordion } from '@modules/content/components/faq-accordion'
import SidebarBookmarks from '@modules/content/components/sidebar-bookmarks'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'FAQs | Wisled',
  description:
    'Trouvez rapidement les réponses aux questions fréquentes concernant nos produits/services.',
}

export default async function FAQPage() {
  const result = await getFAQ()
  const faqSections: FAQSection[] = result?.data?.FAQSection ?? []

  const bookmarks = faqSections.map((section) => ({
    id: section.Bookmark,
    label: section.Title,
  }))

  return (
    <Container className="min-h-screen max-w-full bg-secondary !p-0">
      <Container className="!py-8">
        <StoreBreadcrumbs breadcrumb="Frequently asked questions" />
        <Heading as="h1" className="mt-4 text-4xl medium:text-5xl">
          Questions fréquentes
        </Heading>
        <Box className="mt-6 grid grid-cols-12 medium:mt-12">
          <Box className="col-span-12 mb-10 medium:col-span-3 medium:mb-0">
            <SidebarBookmarks data={bookmarks} />
          </Box>

          <Box className="col-span-12 space-y-10 medium:col-span-8 medium:col-start-5">
            {faqSections.length > 0 ? (
              faqSections.map((section, id) => (
                <FAQAccordion key={id} data={section} />
              ))
            ) : (
              <p className="text-secondary">Aucune question disponible pour le moment.</p>
            )}
          </Box>
        </Box>
      </Container>
    </Container>
  )
}
