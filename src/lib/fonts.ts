import localFont from 'next/font/local'

/**
 * Self-hosted font files.
 *
 * These are the exact latin subsets that `next/font/google` downloaded at
 * build time. Vendoring them keeps the typography identical while removing the
 * build-time request to fonts.googleapis.com, which can fail in CI/Railpack
 * environments with restricted outbound network access.
 *
 * Keep the weights in sync with what the storefront actually uses so the
 * generated @font-face rules match the previous Google Fonts configuration.
 */

export const montserrat = localFont({
  src: '../fonts/montserrat-latin.woff2',
  weight: '400 700',
  variable: '--font-montserrat',
  display: 'swap',
})

export const plusJakartaSans = localFont({
  src: '../fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 700',
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

export const sora = localFont({
  src: '../fonts/sora-latin.woff2',
  weight: '600 700',
  variable: '--font-sora',
  display: 'swap',
})

export const orbitron = localFont({
  src: '../fonts/orbitron-latin.woff2',
  weight: '700',
  display: 'swap',
})
