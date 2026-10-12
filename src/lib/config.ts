import Medusa from '@medusajs/js-sdk'

import { getMedusaBackendUrl } from './medusa-env'
import { medusaTimeoutSignal } from '@lib/util/medusa-timeout'

const MEDUSA_BACKEND_URL = getMedusaBackendUrl(process.env)

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// Every SDK request funnels through Client.fetch -> this.fetch_. Wrapping
// it here gives every store/admin/auth call a hard deadline without
// touching each call site: a suspended or sleeping backend would otherwise
// hang each request for the platform's ~60s give-up time. A caller that
// already set its own signal keeps control of its own timing.
const originalFetch = sdk.client.fetch_
sdk.client.fetch_ = (input, init) => {
  if (init?.signal) {
    return originalFetch(input, init)
  }

  return originalFetch(input, { ...init, signal: medusaTimeoutSignal() })
}
