import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

/**
 * Cached Payload local client for Server Components.
 *
 * Uses Payload's *local* API, so queries go straight to Postgres in-process
 * instead of over HTTP to a CMS endpoint. No API token, no network hop, and
 * no need to expose the CMS publicly for the storefront to read it.
 *
 * The instance is memoised per server process: Payload's own `getPayload`
 * already guards against duplicate init, and the extra check keeps React's
 * dev-mode module re-evaluation from rebuilding the client on every reload.
 */
let clientPromise: Promise<Payload> | null = null

export const getCmsClient = (): Promise<Payload> => {
  if (!clientPromise) {
    clientPromise = getPayload({ config })
  }
  return clientPromise
}
