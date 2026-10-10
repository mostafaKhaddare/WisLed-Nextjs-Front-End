'use client'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { BlogPost } from 'types/strapi'

/**
 * Thumbnail tints, one per position in the stack. The mock cycles warm →
 * violet → cyan so consecutive cards never look identical.
 */
const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #FFF3DC 0%, #FFE2A8 100%)',
  'linear-gradient(135deg, #E9E2FF 0%, #C9B8FF 100%)',
  'linear-gradient(135deg, #D8F5FF 0%, #9FE3FA 100%)',
]

/** Small inner bar drawn on the thumbnail, standing in for the cover art. */
const THUMB_BARS = [
  { fill: '#FFC15A', ring: 'rgba(255,170,40,0.7)' },
  { fill: '#8B6BFF', ring: 'rgba(130,90,255,0.6)' },
  { fill: '#1FB5E0', ring: 'rgba(30,170,230,0.6)' },
]

type BlogCardProps = {
  post: BlogPost
  index: number
}

/**
 * Blog posts have no dedicated excerpt field, so one is derived from the body:
 * tags stripped, entities decoded, collapsed to a single line and cut on a word
 * boundary near the mock's two-line length.
 */
function excerptOf(content: string): string {
  if (!content) return ''

  const plain = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= 110) return plain

  const cut = plain.slice(0, 110)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Horizontal blog card: 84x84 rounded thumbnail on the left, title and
 * excerpt stacked on the right. Matches the mock's 112px tall white tile.
 */
const BlogCard = ({ post, index }: BlogCardProps) => {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length]
  const bar = THUMB_BARS[index % THUMB_BARS.length]
  const excerpt = post.Description ?? excerptOf(post.Content)

  return (
    <LocalizedClientLink
      href={`/blog/${post.Slug}`}
      className="flex h-[112px] items-center gap-4 rounded-[20px] bg-white p-[14px] shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.14)] transition-shadow hover:shadow-[0_2px_4px_rgba(20,20,59,0.06),0_16px_32px_-16px_rgba(20,20,59,0.2)] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]"
      data-testid="blog-card"
    >
      {/* Thumbnail */}
      <div
        aria-hidden="true"
        className="relative grid h-[84px] w-[84px] shrink-0 place-items-center overflow-hidden rounded-2xl"
        style={{ background: gradient }}
      >
        <span
          className="block h-[15.9px] w-[46.7px] rounded"
          style={{
            background: bar.fill,
            boxShadow: `0 0 18px 4px ${bar.ring}`,
          }}
        />
      </div>

      {/* Copy */}
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="line-clamp-2 font-jakarta text-[15px] font-bold leading-snug text-[#0F1B33] dark:text-white">
          {post.Title}
        </h3>
        {excerpt && (
          <p className="line-clamp-2 font-jakarta text-[13px] leading-snug text-[#5B6577] dark:text-gray-400">
            {excerpt}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}

/** WhatsApp / FAQ help panel shown directly under the blog list. */
const HelpCard = () => (
  <Box className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.14)] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]">
    <Heading
      as="h3"
      className="font-sora text-[19px] font-semibold leading-snug text-[#0F1B33] dark:text-white"
    >
      Besoin d&apos;aide pour votre projet ?
    </Heading>
    <p className="font-jakarta text-sm leading-[1.45] text-[#5B6577] dark:text-gray-400">
      Décrivez votre espace : on vous conseille le ruban, l&apos;alimentation et
      le contrôleur adaptés.
    </p>

    <LocalizedClientLink
      href="https://wa.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-3xl bg-[#25D366] font-jakarta text-[15px] font-bold leading-none text-[#06260F] transition-colors hover:bg-[#1FBE5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#06260F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" />
      </svg>
      Écrire sur WhatsApp
    </LocalizedClientLink>

    <LocalizedClientLink
      href="/faq"
      className="mx-auto mt-1 font-jakarta text-sm font-semibold text-[#0F1B33] hover:underline dark:text-white"
    >
      Voir la FAQ
    </LocalizedClientLink>
  </Box>
)

export function ExploreBlog({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) return null

  return (
    <Container className="!py-8 small:!py-12" data-testid="get-inspired-section">
      <Box className="flex flex-col gap-5">
        <Box className="flex items-center justify-between">
          <Heading
            as="h2"
            className="text-2xl font-bold text-basic-primary small:text-3xl"
          >
            Actualités
          </Heading>
          <Button className="hidden w-max large:flex" variant="tonal" asChild>
            <LocalizedClientLink href="/blog">Read more</LocalizedClientLink>
          </Button>
        </Box>

        {/* Single stacked column of horizontal cards, at every breakpoint. */}
        <Box className="flex flex-col gap-3">
          {posts.map((post, index) => (
            <BlogCard key={post.Slug || index} post={post} index={index} />
          ))}
        </Box>

        <HelpCard />

        <Button className="mx-auto flex w-max large:hidden" asChild>
          <LocalizedClientLink href="/blog">Afficher tout</LocalizedClientLink>
        </Button>
      </Box>
    </Container>
  )
}
