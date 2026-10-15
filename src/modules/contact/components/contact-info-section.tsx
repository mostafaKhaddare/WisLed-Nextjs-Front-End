import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'

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

const CONTACT_CARDS = [
  {
    Title: 'Téléphone',
    Text: '+212 710 420 420',
    Link: 'tel:+212710420420',
    icon: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
  },
  {
    Title: 'Email',
    Text: 'info@wisled.ma',
    Link: 'mailto:info@wisled.ma',
    icon: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    Title: 'WhatsApp',
    Text: '+212 710 420 420',
    Link: 'https://wa.me/212710420420',
    icon: (
      <svg
        className="h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    Title: 'Adresse',
    Text: 'Casablanca, Maroc',
    Link: null,
    icon: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
]

export const ContactInfoSection = ({ data }: { data: ContactInfoData }) => {
  const methods: ContactMethod[] = Array.isArray(data)
    ? data
    : data?.ContactMethods ?? []

  if (!methods.length) return null

  return (
    <section className="bg-[#F7F8FC] py-12 small:py-16">
      <Container>
        <div className="mx-auto grid max-w-3xl gap-5 small:grid-cols-2 large:grid-cols-4">
          {CONTACT_CARDS.map((card, index) => {
            const href = card.Link
            const content = (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8]/10">
                  {card.icon}
                </div>
                <Heading as="h3" className="mb-1 text-sm font-bold text-[#0F1B33]">
                  {card.Title}
                </Heading>
                <p className="text-sm text-[#5B6577]">{card.Text}</p>
              </>
            )
            return href ? (
              <a
                key={`card-${index}`}
                href={href}
                className="group flex flex-col rounded-[14px] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,51,0.06),0_4px_12px_rgba(15,27,51,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {content}
                <svg
                  className="ml-auto mt-2 h-4 w-4 text-[#1D4ED8] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                  />
                </svg>
              </a>
            ) : (
              <Box
                key={`card-${index}`}
                className="rounded-[14px] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,51,0.06),0_4px_12px_rgba(15,27,51,0.04)]"
              >
                {content}
              </Box>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
