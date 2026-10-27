'use client'

import Image from 'next/image'

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
 * Desktop blog card: 160px square image area, title 18px bold, 2-line excerpt
 * in #5B6577, radius 24px, subtle border, hover lift 2px.
 */
const DesktopBlogCard = ({ post, index }: BlogCardProps) => {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length]
  const bar = THUMB_BARS[index % THUMB_BARS.length]
  const excerpt = post.Description ?? excerptOf(post.Content)
  const cover = post.FeaturedImage?.url

  return (
    <LocalizedClientLink
      href={`/blog/${post.Slug}`}
      className="group block rounded-[24px] border border-[#E4E7EF] bg-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(20,20,59,0.12)] dark:border-white/[0.08] dark:bg-[#141A2B]"
      data-testid="blog-card"
    >
      {/* Image area: 160px square */}
      <div
        className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-[20px]"
        style={cover ? undefined : { background: gradient }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={post.FeaturedImage?.alternativeText ?? post.Title}
            fill
            sizes="160px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[40px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded"
              style={{
                background: bar.fill,
                boxShadow: `0 0 24px 6px ${bar.ring}`,
              }}
            />
            <span className="absolute inset-0 grid place-items-center bg-black/5" />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h3 className="line-clamp-2 font-jakarta text-[18px] font-bold leading-snug text-[#0F1B33] dark:text-white group-hover:text-[#1D4ED8] transition-colors">
          {post.Title}
        </h3>
        {excerpt && (
          <p className="line-clamp-2 font-jakarta text-[14px] leading-relaxed text-[#5B6577] dark:text-gray-400">
            {excerpt}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}

/**
 * Mobile blog card: horizontal 84x84 thumbnail with title and excerpt on the right.
 * Keeps the existing mobile layout untouched.
 */
const MobileBlogCard = ({ post, index }: BlogCardProps) => {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length]
  const bar = THUMB_BARS[index % THUMB_BARS.length]
  const excerpt = post.Description ?? excerptOf(post.Content)
  const cover = post.FeaturedImage?.url

  return (
    <LocalizedClientLink
      href={`/blog/${post.Slug}`}
      className="flex h-[112px] items-center gap-4 rounded-[20px] bg-white p-[14px] shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.14)] transition-shadow hover:shadow-[0_2px_4px_rgba(20,20,59,0.06),0_16px_32px_-16px_rgba(20,20,59,0.2)] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]"
      data-testid="blog-card"
    >
      <div
        className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl"
        style={cover ? undefined : { background: gradient }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={post.FeaturedImage?.alternativeText ?? post.Title}
            fill
            sizes="84px"
            className="object-cover object-center"
          />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[15.9px] w-[46.7px] -translate-x-1/2 -translate-y-1/2 rounded"
              style={{
                background: bar.fill,
                boxShadow: `0 0 18px 4px ${bar.ring}`,
              }}
            />
            <span className="absolute inset-0 grid place-items-center bg-black/5" />
          </>
        )}
      </div>

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

/** "Besoin d'aide ?" card — horizontal layout on desktop, vertical on mobile. */
const HelpCard = () => {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '212648522511'
  const defaultMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Bonjour ! 👋 Je souhaite en savoir plus sur vos produits et solutions d'éclairage LED."
  const encodedMessage = encodeURIComponent(defaultMessage)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  return (
    <Box
      className={`
        flex flex-col gap-3 rounded-3xl p-5 shadow-[0_8px_24px_-14px_rgba(20,20,59,0.35)]
        dark:shadow-none dark:ring-1 dark:ring-white/10
        lg:flex-row lg:items-center lg:justify-between lg:p-[40px]
      `}
      style={{
        background:
          'radial-gradient(120% 120% at 100% 0%, #EAF1FF 0%, #FFFFFF 58%)',
      }}
    >
      <div className="flex flex-col gap-1">
        <Heading
          as="h3"
          className={`
            font-sora text-[19px] font-semibold leading-snug text-[#0F1B33] dark:text-white
            lg:text-[24px]
          `}
        >
          Besoin d&apos;aide pour votre projet ?
        </Heading>
        <p className="font-jakarta text-sm leading-[1.45] text-[#5B6577] dark:text-gray-400 lg:max-w-[420px]">
          Décrivez votre espace : on vous conseille le ruban, l&apos;alimentation et
          le contrôleur adaptés.
        </p>
      </div>

      <div className={`
        flex flex-col gap-2 mt-1 w-full
        lg:flex-row lg:items-center lg:gap-3 lg:mt-0 lg:w-auto
      `}>
        <LocalizedClientLink
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-3xl bg-[#25D366] font-jakarta text-[15px] font-bold leading-none text-[#06260F] transition-colors hover:bg-[#1FBE5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2
            lg:w-auto lg:px-6
          `}
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
          href="/chat"
          className={`
            inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-3xl bg-[#1D4ED8] font-jakarta text-[15px] font-bold leading-none text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2
            lg:w-auto lg:px-6
          `}
          aria-label="Ouvrir le chat en direct"
        >
          Chat en direct
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/faq"
          className={`
            mx-auto mt-1 font-jakarta text-sm font-semibold text-[#0F1B33] hover:underline dark:text-white
            lg:mx-0 lg:mt-0 lg:text-[15px]
          `}
        >
          Voir la FAQ
        </LocalizedClientLink>
      </div>
    </Box>
  )
}

export function ExploreBlog({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) return null

  return (
    <Container className="!py-8 small:!py-12" data-testid="get-inspired-section">
      <Box className="flex flex-col gap-5">
        {/* Title row: heading + "Afficher tout" link */}
        <Box className="flex items-center justify-between">
          <Heading as="h2" className="text-2xl font-bold text-basic-primary small:text-3xl">
            Actualités
          </Heading>
          <div className={`
            hidden w-max large:flex
            lg:flex
          `}>
            <Button variant="tonal" asChild>
              <LocalizedClientLink href="/blog">Afficher tout</LocalizedClientLink>
            </Button>
          </div>
          <div className="flex items-end">
            <Button className="hidden w-max large:flex" variant="tonal" asChild>
              <LocalizedClientLink href="/blog">Read more</LocalizedClientLink>
            </Button>
          </div>
        </Box>

        {/* Desktop: 3 equal cards in a grid (gap 20px). Mobile: stacked horizontal cards. */}
        <div
          className={`
            flex flex-col gap-3
            lg:grid lg:grid-cols-3 lg:gap-[20px]
          `}
        >
          {posts.map((post, index) => (
            <>
              <MobileBlogCard key={`mobile-${post.Slug || index}`} post={post} index={index} />
              <DesktopBlogCard key={`desktop-${post.Slug || index}`} post={post} index={index} />
            </>
          ))}
        </div>

        {/* "Afficher tout" sits directly under the news list (mobile only). */}
        <Button className="mx-auto flex w-max hidden lg:block" asChild>
          <LocalizedClientLink href="/blog">Afficher tout</LocalizedClientLink>
        </Button>

        <HelpCard />
      </Box>
    </Container>
  )
}
