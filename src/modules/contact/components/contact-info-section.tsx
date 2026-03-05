import Image from 'next/image'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'

type ContactMethod = {
  Title?: string
  Text?: string
  Link?: string
  Icon?: {
    url?: string
    alternativeText?: string
  }
}

type ContactInfoData =
  | {
    Title?: string
    ContactMethods?: ContactMethod[]
  }
  | ContactMethod[]

/* ─── Icon config per method type ─── */
type IconStyle = {
  color: string
  bg: string
  darkBg: string
  darkColor: string
}

function getIconStyle(title?: string): IconStyle {
  const t = (title || '').toLowerCase()
  if (t.includes('phone') || t.includes('téléphone') || t.includes('appel')) {
    return {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      darkBg: 'dark:bg-emerald-900/20',
      darkColor: 'dark:text-emerald-400',
    }
  }
  if (t.includes('email') || t.includes('mail') || t.includes('courriel')) {
    return {
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      darkBg: 'dark:bg-brand-900/20',
      darkColor: 'dark:text-brand-400',
    }
  }
  if (t.includes('whatsapp')) {
    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      darkBg: 'dark:bg-green-900/20',
      darkColor: 'dark:text-green-400',
    }
  }
  // Default: location / address
  return {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/20',
    darkColor: 'dark:text-orange-400',
  }
}

function FallbackIcon({ type, className }: { type?: string; className?: string }) {
  const title = (type || '').toLowerCase()

  if (title.includes('phone') || title.includes('téléphone') || title.includes('appel')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    )
  }
  if (title.includes('email') || title.includes('mail') || title.includes('courriel')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    )
  }
  if (title.includes('whatsapp')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  }
  // Default: map/location
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

export const ContactInfoSection = ({ data }: { data: ContactInfoData }) => {
  const sectionTitle = Array.isArray(data) ? undefined : data?.Title
  const methods = Array.isArray(data) ? data : data?.ContactMethods

  if (!methods?.length) return null

  return (
    <section className="bg-secondary/40 dark:bg-white/[0.015]">
      <Container className="py-12 small:py-16">
        {/* Section header */}
        {sectionTitle && (
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-basic-primary/10 bg-primary px-4 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary dark:text-white/40">Nous vous répondons</span>
            </div>
            <Heading className="text-2xl font-black tracking-tight text-basic-primary dark:text-white small:text-3xl">
              {sectionTitle}
            </Heading>
          </div>
        )}

        <Box className="grid gap-5 small:grid-cols-2 large:grid-cols-3">
          {methods.map((method, id) => {
            const iconStyle = getIconStyle(method.Title)
            return (
              <Box
                key={`contact-method-${id}`}
                className="group relative overflow-hidden rounded-2xl border border-basic-primary/10 bg-primary p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-basic-primary/20 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#0f1115] dark:hover:border-white/[0.12]"
              >
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 60%)' }} />

                {/* Icon */}
                <Box className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${iconStyle.bg} ${iconStyle.darkBg} shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}>
                  {method.Icon?.url ? (
                    <Image
                      src={process.env.NEXT_PUBLIC_STRAPI_URL + method.Icon.url}
                      height={26}
                      width={26}
                      alt={method.Icon.alternativeText ?? 'Contact icon'}
                    />
                  ) : (
                    <FallbackIcon
                      type={method.Title}
                      className={`h-6 w-6 ${iconStyle.color} ${iconStyle.darkColor}`}
                    />
                  )}
                </Box>

                {/* Title */}
                <Heading as="h3" className="mb-1.5 text-base font-bold text-basic-primary dark:text-white">
                  {method.Title}
                </Heading>

                {/* Value / Link */}
                {method.Link ? (
                  <a
                    href={method.Link}
                    className="group/link inline-flex items-center gap-1.5 text-[15px] font-medium text-secondary transition-colors duration-200 hover:text-action-primary dark:text-white/50 dark:hover:text-brand-400"
                  >
                    {method.Text}
                    <svg
                      className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                  </a>
                ) : (
                  <Text className="text-[15px] text-secondary dark:text-white/50">
                    {method.Text}
                  </Text>
                )}

                {/* Bottom separator line with brand color */}
                <div className={`mt-5 h-0.5 w-10 rounded-full ${iconStyle.bg} ${iconStyle.darkBg} transition-all duration-300 group-hover:w-16`}>
                  <div className={`h-full w-full rounded-full ${iconStyle.color.replace('text-', 'bg-')} opacity-60`} />
                </div>
              </Box>
            )
          })}
        </Box>
      </Container>
    </section>
  )
}
