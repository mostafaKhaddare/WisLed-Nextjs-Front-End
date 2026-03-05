import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { ContentAttributes } from 'types/strapi'

export const ContactHeaderSection = ({ data }: { data: ContentAttributes }) => {
  return (
    <section className="relative w-full overflow-hidden bg-doc-gradient text-white">
      {/* Animated Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
        {/* Grid dot overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <Container className="relative flex flex-col items-center justify-between gap-10 py-16 large:flex-row large:gap-16 large:py-28">
        {/* Text content */}
        <Box className="text-center large:max-w-[600px] large:text-left">
          {/* Eyebrow badge */}
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/90">
              Équipe disponible · En ligne
            </span>
          </div>

          <Heading className="mb-5 text-4xl font-black leading-[1.1] tracking-tight text-white small:text-5xl large:text-6xl">
            {data.Title}
          </Heading>

          <Text size="lg" className="mb-8 max-w-[52ch] leading-relaxed text-white/70">
            {data.Text}
          </Text>

          {/* CTA stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 large:justify-start">
            {[
              { value: '< 24h', label: 'Temps de réponse' },
              { value: '100%', label: 'Satisfaction client' },
              { value: '5⭐', label: 'Service premium' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5 large:items-start">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </Box>

        {/* Hero image */}
        {data.Image ? (
          <Box className="relative h-[280px] w-full max-w-[480px] shrink-0 overflow-hidden rounded-3xl border border-white/15 shadow-2xl large:h-[380px] large:w-[520px]">
            <Image
              src={process.env.NEXT_PUBLIC_STRAPI_URL + data.Image.url}
              alt={data.Image.alternativeText ?? 'Contact WisLed'}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5" />
            {/* Bottom frosted label */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-black/30 px-4 py-3 backdrop-blur-md">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/80">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90">Assistance personnalisée</span>
                <span className="text-[10px] text-white/50">Réponse garantie en 24h</span>
              </div>
            </div>
          </Box>
        ) : (
          /* Fallback decorative card if no image */
          <Box className="flex h-[280px] w-full max-w-[380px] shrink-0 flex-col items-center justify-center gap-6 rounded-3xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm large:h-[340px] large:w-[420px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <svg className="h-10 w-10 text-white/80" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">info@wisled.ma</p>
              <p className="mt-1 text-sm text-white/50">Réponse sous 24h ouvrables</p>
            </div>
          </Box>
        )}
      </Container>
    </section>
  )
}
