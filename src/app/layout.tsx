import { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import { getBaseURL } from '@lib/util/env'
import { WishlistProvider } from '@lib/context/wishlist-context'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { Toaster } from 'sonner'

import 'styles/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: '%s | WisLed',
    default: 'WisLed - Éclairage LED Moderne & Design',
  },
  description: 'Découvrez notre collection exclusive de luminaires LED modernes. Qualité premium, design innovant et économie d\'énergie pour sublimer votre intérieur.',
  keywords: ['LED', 'Éclairage', 'Design', 'Luminaire', 'Intérieur', 'Décoration'],
  openGraph: {
    title: 'WisLed - Éclairage LED Moderne & Design',
    description: 'Découvrez notre collection exclusive de luminaires LED modernes.',
    url: getBaseURL(),
    siteName: 'WisLed',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={montserrat.variable}>
      <body className="text-basic-primary font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        // disableTransitionOnChange
        >
          <WishlistProvider>
            <ProgressBar />
            <Toaster position="bottom-right" offset={65} closeButton />
            <main className="relative">{props.children}</main>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
