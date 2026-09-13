import Medusa from '@medusajs/js-sdk'

const DEFAULT_MEDUSA_BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-medusa-backend-url.onrender.com'
    : 'http://localhost:9000'

let MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || DEFAULT_MEDUSA_BACKEND_URL

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
