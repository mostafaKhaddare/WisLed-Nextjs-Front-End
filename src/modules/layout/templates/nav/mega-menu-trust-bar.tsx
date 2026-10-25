import type { ReactNode } from 'react'

import { cn } from '@lib/util/cn'

type TrustBadge = {
  title: string
  subtitle: string
  icon: ReactNode
}

const badges: TrustBadge[] = [
  {
    title: 'Livraison nationale',
    subtitle: 'Partout au Maroc',
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
  },
  {
    title: 'Paiement à la livraison',
    subtitle: 'Disponible selon la ville',
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  },
  {
    title: 'Retour 7 jours',
    subtitle: 'Satisfait ou remboursé',
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
        />
      </svg>
    ),
  },
]

export default function MegaMenuTrustBar({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-basic-primary/[0.07] bg-secondary/25 dark:border-white/[0.05] dark:bg-white/[0.015]',
        className
      )}
    >
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto px-6 py-3 xl:gap-8 xl:px-8">
        {badges.map((badge, index) => (
          <div
            key={badge.title}
            className="flex shrink-0 items-center gap-4 xl:gap-8"
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className="bg-basic-primary/[0.08] h-7 w-px dark:bg-white/[0.07]"
              />
            )}
            <div className="flex items-center gap-2.5">
              <span className="bg-action-primary/[0.08] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-action-primary dark:bg-wisled-400/10 dark:text-wisled-400">
                {badge.icon}
              </span>
              <span className="flex flex-col">
                <span className="whitespace-nowrap text-[11px] font-semibold leading-tight text-basic-primary/85 dark:text-white/80">
                  {badge.title}
                </span>
                <span className="whitespace-nowrap text-[10px] leading-tight text-secondary dark:text-white/40">
                  {badge.subtitle}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
