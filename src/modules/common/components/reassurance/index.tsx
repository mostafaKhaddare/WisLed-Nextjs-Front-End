import { Container } from '@modules/common/components/container'

/** One entry in the reassurance strip. */
type ReassuranceItem = {
  icon: React.ReactNode
  title: string
  description?: string
}

/**
 * Inline line icons. Inlined rather than shipped as image assets so they inherit
 * the current text colour, stay crisp at any size, and cost no extra requests.
 */
const icons = {
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" strokeLinejoin="round" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </svg>
  ),
  refund: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 10a8 8 0 1 1 2 6" strokeLinecap="round" />
      <path d="M4 5v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 13a7 7 0 0 1 14 0v4a2 2 0 0 1-2 2h-1v-6h3M5 13v4a2 2 0 0 0 2 2h1v-6H5" strokeLinejoin="round" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  ),
}

const ITEMS: ReassuranceItem[] = [
  {
    icon: icons.truck,
    title: 'Livraison express',
    description: 'Expédié sous 24h, suivi inclus',
  },
  {
    icon: icons.box,
    title: '+ de 5 000 références',
    description: 'et des millions de pièces en stock',
  },
  {
    icon: icons.refund,
    title: 'Satisfait ou remboursé',
    description: '14 jours pour changer d’avis',
  },
  {
    icon: icons.shield,
    title: 'Garantie 2 ans',
    description: 'sur toute la gamme LED',
  },
  {
    icon: icons.support,
    title: 'Service client',
    description: 'Une équipe à votre écoute',
  },
  {
    icon: icons.lock,
    title: 'Paiement 100% sécurisé',
    description: 'Carte et PayPal via Stripe',
  },
]

/**
 * Reassurance strip shown before the footer on every page.
 *
 * It renders on the server with no props and no data dependency, so it can be
 * dropped straight into the layout without touching any page.
 */
export default function Reassurance() {
  return (
    <section aria-label="Nos engagements" className="border-t border-[#F0F2F8] bg-white dark:border-white/10 dark:bg-[#0F1B33]">
      <Container className="!py-8 small:!py-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 small:grid-cols-3 large:grid-cols-6">
          {ITEMS.map((item) => (
            <li key={item.title} className="flex flex-col items-center gap-2 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#F0F2F8] text-[#1D4ED8] dark:bg-white/[0.06] dark:text-[#FFC857]">
                <span className="block h-[22px] w-[22px]">{item.icon}</span>
              </span>
              <span className="font-jakarta text-[13px] font-bold leading-snug text-[#0F1B33] dark:text-white">
                {item.title}
              </span>
              {item.description && (
                <span className="font-jakarta text-[11.5px] leading-snug text-[#5B6577] dark:text-gray-400">
                  {item.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
