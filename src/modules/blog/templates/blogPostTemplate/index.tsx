import Image from 'next/image'

import { cn } from '@lib/util/cn'
import BlogBreadcrumbs from '@modules/blog/components/blog-breadcrumbs'
import { BlogContent } from '@modules/blog/components/blog-content'
import { BlogInfo } from '@modules/blog/components/blog-info'
import { TableOfContents } from '@modules/blog/components/blog-table-of-contents'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { BlogPost } from 'types/strapi'

export default async function BlogPostTemplate({
  article,
  countryCode,
}: {
  countryCode: string
  article: BlogPost
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
    <Container className="flex flex-col gap-8 !py-8 medium:gap-12">
      {/* Header Section */}
      <Box className="flex flex-col gap-6">
        <BlogBreadcrumbs blogTitle={article.Title} countryCode={countryCode} />
        <Heading as="h1" className="text-4xl font-bold text-basic-primary small:text-5xl leading-tight">
          {article.Title}
        </Heading>
        <BlogInfo
          createdAt={article.createdAt}
          readTime={readTime(article.Content)}
        />
      </Box>

      {/* Main Content Grid */}
      <Box className="grid grid-cols-12 gap-6 medium:gap-8">
        {/* Table of Contents Sidebar */}
        <Box
          className={cn(
            'col-span-12 hidden large:col-span-3 large:block sticky top-24',
            hasHeadings ? 'block' : 'hidden'
          )}
        >
          <Box className="rounded-lg bg-secondary/5 p-6">
            <TableOfContents headings={headings} />
          </Box>
        </Box>

        {/* Main Article Content */}
        <Box
          className={cn(
            'col-span-12 large:col-span-9 large:col-start-5',
            hasHeadings
              ? 'large:col-span-9'
              : 'large:col-span-10 large:col-start-2'
          )}
        >
          {/* Featured Image */}
          <Box className="relative mb-8 h-[300px] w-full overflow-hidden rounded-lg shadow-lg medium:h-[450px]">
            <Image
              src={process.env.NEXT_PUBLIC_STRAPI_URL + article.FeaturedImage.url}
              alt={`${article.FeaturedImage.alternativeText ? article.FeaturedImage.alternativeText : article.Title}`}
              fill
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
          </Box>

          {/* First Paragraph - Intro */}
          <Box className="mb-8 border-l-4 border-action-primary bg-secondary/5 p-6 medium:mb-12">
            <BlogContent content={firstParagraph} />
          </Box>

          {/* Mobile Table of Contents */}
          <Box className="my-8 rounded-lg bg-secondary/5 p-6 medium:hidden">
            <TableOfContents headings={headings} />
          </Box>

          {/* Rest of Content */}
          <Box className="prose prose-invert max-w-none">
            <BlogContent content={restOfContent} />
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
