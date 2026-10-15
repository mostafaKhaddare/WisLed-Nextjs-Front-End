import Image from 'next/image'
import { Suspense } from 'react'

import { cn } from '@lib/util/cn'
import BlogBreadcrumbs from '@modules/blog/components/blog-breadcrumbs'
import { BlogContent } from '@modules/blog/components/blog-content'
import { BlogInfo } from '@modules/blog/components/blog-info'
import { TableOfContents } from '@modules/blog/components/blog-table-of-contents'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@modules/common/icons'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { BlogPost } from 'types/strapi'
import { StoreProduct } from '@medusajs/types'

const TABS = [
  { id: 'article', label: 'Article' },
  { id: 'related', label: 'Articles associés' },
  { id: 'products', label: 'Produits' },
]

export default async function BlogPostTemplate({
  article,
  countryCode,
  prevPost,
  nextPost,
  relatedArticles,
  recommendedProducts,
}: {
  countryCode: string
  article: BlogPost
  prevPost?: BlogPost | null
  nextPost?: BlogPost | null
  relatedArticles: BlogPost[]
  recommendedProducts: StoreProduct[]
}) {
  const readTime = (content: string) => {
    const wordsPerMinute = 200
    const noOfWords = content.split(/\s/g).length
    const minutes = noOfWords / wordsPerMinute
    return Math.ceil(minutes)
  }

  const extractHeadings = (markdown: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings = []
    let match
    while ((match = headingRegex.exec(markdown)) !== null) {
      extractedHeadings.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/\s+/g, '-'),
      })
    }
    return extractedHeadings
  }

  const headings = extractHeadings(article.Content)
  const hasHeadings = headings.length > 0

  const paragraphs = article.Content.split('\n\n')
  const firstParagraph = paragraphs[0]
  const restOfContent = paragraphs.slice(1).join('\n\n')

  return (
    <>
      {/* Dark Top Bar */}
      <div className="bg-[#0F1B33] text-white small:py-3">
        <Container className="flex items-center justify-between">
          <a
            href={`/${countryCode}/blog`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-white/70 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Retour au blog
          </a>
          <div className="flex items-center gap-4 text-[12px] text-white/50">
            <span>WisLed | Expert en éclairage LED</span>
          </div>
        </Container>
      </div>

      <Container className="py-8 large:py-12">
        <BlogBreadcrumbs blogTitle={article.Title} countryCode={countryCode} />

        {/* Article Header */}
        <Box className="mt-6 flex flex-col gap-6">
          <Heading
            as="h1"
            className="text-3xl font-black tracking-tight text-[#0F1B33] small:text-4xl large:text-5xl"
          >
            {article.Title}
          </Heading>
          <BlogInfo
            createdAt={article.createdAt}
            readTime={readTime(article.Content)}
          />
        </Box>

        {/* Article Navigation (prev/next) */}
        <Box className="my-8 flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 dark:border-white/[0.06]">
          {prevPost ? (
            <LocalizedClientLink
              href={`/blog/${prevPost.Slug}`}
              className="group flex items-center gap-2.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8]/10 group-hover:bg-[#1D4ED8]/20">
                <ChevronLeftIcon className="h-4 w-4 text-[#1D4ED8]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B6577]">
                  Article précédent
                </span>
                <span className="text-sm font-semibold text-[#0F1B33] group-hover:text-[#1D4ED8]">
                  {prevPost.Title}
                </span>
              </div>
            </LocalizedClientLink>
          ) : (
            <div className="w-1/2" />
          )}

          {nextPost ? (
            <LocalizedClientLink
              href={`/blog/${nextPost.Slug}`}
              className="group flex items-center justify-end gap-2.5"
            >
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B6577]">
                  Article suivant
                </span>
                <span className="text-sm font-semibold text-[#0F1B33] group-hover:text-[#1D4ED8]">
                  {nextPost.Title}
                </span>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8]/10 group-hover:bg-[#1D4ED8]/20">
                <ChevronRightIcon className="h-4 w-4 text-[#1D4ED8]" />
              </div>
            </LocalizedClientLink>
          ) : (
            <div className="w-1/2" />
          )}
        </Box>

        {/* Featured Image */}
        <Box className="relative my-8 h-[280px] w-full overflow-hidden rounded-[20px] shadow-lg medium:h-[450px]">
          <Image
            src={article.FeaturedImage.url}
          alt={article.FeaturedImage.alternativeText ?? article.Title}
            fill
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </Box>

        {/* Content Layout with Table of Contents */}
        <Box className="grid grid-cols-12 gap-6 medium:gap-8 items-start">
          {/* Table of Contents Sidebar (desktop) */}
          {hasHeadings && (
            <Box className="col-span-12 hidden large:col-span-3 large:block">
              <Box className="rounded-xl bg-[#F7F8FC] p-6">
                <TableOfContents headings={headings} />
              </Box>
            </Box>
          )}

          {/* Table of Contents Sidebar (mobile) */}
          <Box className="col-span-12 my-8 rounded-xl bg-[#F7F8FC] p-6 medium:hidden">
            <TableOfContents headings={headings} />
          </Box>

          {/* Main Article Content */}
          <Box
            className={cn(
              'col-span-12',
              hasHeadings ? 'large:col-span-9' : 'large:col-span-10 large:col-start-2'
            )}
          >
            {/* First Paragraph - Intro */}
            <Box className="mb-8 border-l-4 border-[#1D4ED8] bg-[#F7F8FC] p-6 medium:mb-12">
              <BlogContent content={firstParagraph} />
            </Box>

            {/* Rest of Content */}
            <Box className="prose prose-invert max-w-none">
              <BlogContent content={restOfContent} />
            </Box>
          </Box>
        </Box>

        {/* Tabs Section - Related Products */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <Box className="mt-16">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8]/10">
                <svg
                  className="h-4 w-4 text-[#1D4ED8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.175 11.013a2.25 2.25 0 01-2.25 2.25h-11.1a2.25 2.25 0 01-2.25-2.25V6.75m0 0L9.75 5.25m0 0L12 7.5m-2.25 0V4.5a2.25 2.25 0 012.25-2.25h.01M15 11.25h-1.5m0 0H9.75m6.75 0v-2.25a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v2.25m-3 0h-3"
                  />
                </svg>
              </div>
              <Heading as="h2" className="text-2xl font-black text-[#0F1B33]">
                Produits associés
              </Heading>
            </div>
            <Suspense fallback={<p>Chargement des produits...</p>}>
              <ProductCarousel
                products={recommendedProducts}
                regionId={''}
                title=""
              />
            </Suspense>
          </Box>
        )}

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <Box className="mt-16">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8]/10">
                <svg
                  className="h-4 w-4 text-[#1D4ED8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.25 12c0-1.21-.23-2.37-.65-3.43v.02c0 .71-.16 1.38-.43 2.02.39.87.63 1.83.63 2.83-.01 1.55-.58 2.97-1.53 4.03-.22.23-.45.44-.69.64l.09 1.12c.08 1.05-1.23 1.57-2.03 1.01-.17-.12-.32-.26-.44-.42-.63-.8-1.28-1.6-1.55-2.53.01-1.4.02-2.79.02-4.17s-.01-2.77-.02-4.17c-.27.93-.92 1.72-1.55 2.53-.13.18-.28.33-.44.44-.81.55-2.11.04-2.49-1.01l.09-1.12c-.24-.2-.47-.4-1-.58-.53-.56-1.12-1.02-1.75-1.38-.09 1.26-.09 2.52 0 3.78.26 3.97 2.17 7.4 5.02 9.6l.02.02c-1.43 1.23-3.22 2.11-5.18 2.11-2.31 0-4.41-.72-6.09-1.95-.25-1.77-.39-3.6-.39-5.44 0-3.64 1.1-7.12 3.02-10.04-.33-.01-.67-.02-1.01-.02C5.96 4.45 2.75 7.66 2.75 11.52 2.75 16.73 6.22 21 11.25 21c1.43 0 2.81-.31 4.05-.89l.02.02c1.92 2.64 5.17 4.4 8.95 4.4 1.7 0 3.3-.42 4.67-1.17.47-.25.91-.55 1.31-.9l.96-1.06c.35-.39.67-.8 0-1.41-.24-.45-1.07-.44-1.41 0l-.47.5c-.04.04-.08.08-.12.12"
                  />
                </svg>
              </div>
              <Heading as="h2" className="text-2xl font-black text-[#0F1B33]">
                Articles associés
              </Heading>
            </div>

            <Box className="grid gap-4 small:grid-cols-2 large:grid-cols-2">
              {relatedArticles.map((post, index) => (
                <LocalizedClientLink
                  key={post.Slug || index}
                  href={`/blog/${post.Slug}`}
                  className="group flex gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-[#F7F8FC]"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={post.FeaturedImage.url}
                    alt={post.FeaturedImage.alternativeText ?? post.Title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="96px"
                  />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-2 font-jakarta text-sm font-bold leading-snug text-[#0F1B33] group-hover:text-[#1D4ED8]">
                      {post.Title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[#5B6577]">
                      {post.Description || post.Content.slice(0, 100)}
                    </p>
                  </div>
                </LocalizedClientLink>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </>
  )
}
