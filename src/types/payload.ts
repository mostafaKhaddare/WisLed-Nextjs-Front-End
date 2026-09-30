/**
 * Payload CMS content types for the storefront.
 *
 * Field names deliberately mirror the Strapi schema attribute names (see
 * src/payload/collections + src/payload/globals) so the data layer can be
 * swapped without touching the components that render this content.
 *
 * Differences from the old Strapi types:
 *   • `url` on media is now a Payload media doc, so it also carries
 *     `filename`, `mimeType`, `width`, `height`, `size`. Anything reading
 *     `url` / `alternativeText` keeps working.
 *   • Rich text (`Content`, `PageContent`) is Lexical editor state, not a
 *     Markdown string. Render it with the `CmsRichText` component, not
 *     react-markdown.
 */

export type CmsMedia = {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alternativeText: string | null
  caption: string | null
}

export type Cta = {
  BtnText?: string | null
  BtnLink?: string | null
}

export type HeroBanner = {
  Headline?: string | null
  Text?: string | null
  CTA?: Cta | null
  Image?: CmsMedia | CmsMedia[] | null
}

export type Homepage = {
  HeroBanner?: HeroBanner | null
  MidBanner?: HeroBanner | null
}

export type BannerResponse<T extends string> = {
  data: {
    [K in T]: HeroBanner
  }
}

export type HeroBannerData = BannerResponse<'HeroBanner'>
export type MidBannerData = BannerResponse<'MidBanner'>

/* Lexical rich text editor state. Treated as opaque here on purpose. */
export type RichTextValue = Record<string, unknown> | null

export type BlogPost = {
  id: string
  Title: string
  Slug?: string | null
  Content: RichTextValue
  FeaturedImage: CmsMedia
  Categories?: { id: string; Title?: string | null; Slug?: string | null }[] | null
  createdAt: string
  updatedAt: string
}

export type BlogData = {
  data: BlogPost[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type Collection = {
  id: string
  Title: string
  Handle: string
  createdAt: string
  updatedAt: string
  Image: CmsMedia
  Description: string
}

export type Category = {
  id: string
  title: string
  handle: string
  createdAt: string
  updatedAt: string
  image: CmsMedia[]
  description?: string | null
}

export type CollectionsData = { data: Collection[] }
export type CategoriesData = { data: Category[] }

export type VariantColor = {
  id: string
  Name: string
  /**
   * Payload blocks. Each entry carries `blockType` of either
   * 'color-hex' (has `Color`) or 'color-image' (has `Image`).
   * Consumers that only test for the presence of `Color` / `Image` are
   * unaffected by the extra key.
   */
  Type: ({ blockType?: string; Color?: string | null; Image?: CmsMedia | null } | null)[]
}

export type VariantColorData = { data: VariantColor[] }

export type ContentSection = {
  id?: string
  Title: string
  Text: string
  Image: CmsMedia
}

export type AboutUs = {
  id: string
  Banner?: CmsMedia | CmsMedia[] | null
  OurStory?: ContentSection | null
  WhyUs?: { id?: string; Title?: string | null; Tile?: ContentSection[] } | null
  OurCraftsmanship?: ContentSection | null
  Numbers?: { id?: string; Title?: string; Text?: string }[] | null
}

export type AboutUsData = { data: AboutUs }

export type Question = {
  id?: string
  Title: string
  Text: string
}

export type FAQSection = {
  id?: string
  Title: string
  Question?: Question[]
  Bookmark: string
}

export type FAQ = { FAQSection?: FAQSection[] }

export type FAQData = { data: FAQ }

export type ContactCard = {
  id?: string
  Icon?: CmsMedia | null
  Title?: string | null
  Text?: string | null
  Link?: string | null
}

export type ContactUs = {
  id: string
  Header?: {
    id?: string
    Title?: string | null
    Text?: string | null
    Image?: CmsMedia | CmsMedia[] | null
  }[]
  ContactMethods?: {
    id?: string
    Title?: string | null
    ContactMethods?: ContactCard[]
  }[]
  FormIntro?: Cta[]
}

export type ContentPage = {
  id: string
  PageContent: RichTextValue
}

export type ContentPageData = { data: ContentPage }

export type Hotspot = {
  id?: string
  product_handle: string
  position_x?: number | null
  position_y?: number | null
}

export type Inspiration = {
  id: string
  title?: string | null
  room_type?: string | null
  image?: CmsMedia[] | null
  hotspots?: Hotspot[]
  createdAt: string
}

export type InspirationsData = { data: Inspiration[] }
