import Hero from '@modules/home/components/hero'
import { getHeroBannerData } from '@lib/data/cms'
import type { HeroBanner, HeroSlide } from 'types/strapi'

export const dynamic = 'force-dynamic'

/**
 * Throwaway smoke test for the hero rewrite. Lives outside `(main)` so it does
 * not inherit NavWrapper/Footer (which need the Medusa backend).
 *
 * Renders the hero twice:
 *   1. with whatever the CMS actually returns, and
 *   2. with a synthetic `Slides` payload, so the new per-slide path can be
 *      exercised even before any slide content exists.
 */
export default async function HeroCheckPage() {
  const { data } = await getHeroBannerData()
  const real = data?.HeroBanner ?? null

  const realImages = Array.isArray(real?.Image)
    ? real!.Image
    : real?.Image
      ? [real!.Image]
      : []
  const pics = realImages.filter(Boolean).slice(0, 2)

  const syntheticSlides: HeroSlide[] = [
    {
      id: 'a',
      Image: pics[0] ?? null,
      Headline: 'SLIDE-ONE-HEADLINE',
      Text: 'SLIDE-ONE-BODY',
      BtnText: 'SLIDE-ONE-BUTTON',
      BtnLink: '/shop',
    },
    {
      id: 'b',
      Image: pics[1] ?? null,
      Headline: 'SLIDE-TWO-HEADLINE',
      Text: 'SLIDE-TWO-BODY',
      BtnText: 'SLIDE-TWO-BUTTON',
      BtnLink: '/collections',
    },
    {
      id: 'c',
      Image: null,
      Headline: 'SLIDE-THREE-HEADLINE',
      BtnText: 'SLIDE-THREE-BUTTON',
      BtnLink: '/about-us',
    },
  ]

  const synthetic: HeroBanner = {
    Headline: 'LEGACY-IGNORED-HEADLINE',
    Text: 'LEGACY-IGNORED-BODY',
    CTA: { id: 0, BtnText: 'LEGACY-BUTTON', BtnLink: '/legacy' },
    Image: realImages,
    Slides: syntheticSlides,
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: 16 }}>
      <pre id="real-meta">
        {JSON.stringify(
          {
            hasRealHero: Boolean(real),
            headline: real?.Headline ?? null,
            slidesFieldPresent: Array.isArray((real as any)?.Slides),
            slidesCount: Array.isArray((real as any)?.Slides)
              ? (real as any).Slides.length
              : null,
            realImageCount: realImages.length,
            syntheticImageCount: pics.length,
          },
          null,
          2
        )}
      </pre>

      <h2>REAL CMS HERO</h2>
      <div id="real-hero">{real ? <Hero data={real} /> : 'no real hero'}</div>

      <h2>SYNTHETIC SLIDES HERO</h2>
      <div id="synthetic-hero">
        <Hero data={synthetic} />
      </div>
    </main>
  )
}
