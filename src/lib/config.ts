import Medusa from '@medusajs/js-sdk'

import { getMedusaBackendUrl } from './medusa-env'

const MEDUSA_BACKEND_URL = getMedusaBackendUrl(process.env)

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
