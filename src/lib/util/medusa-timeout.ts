/**
 * Hard deadline for every request the storefront makes to the Medusa
 * backend.
 *
 * The backend is hosted on Render, whose free instances sleep and whose
 * suspended services stop answering entirely. The Medusa JS SDK sets no
 * bound of its own, so a hung backend stalls each request for the
 * platform's ~60s give-up time — which both slows every storefront page
 * and fails the build, because the sitemap and the static-param
 * generators all wait on it.
 *
 * A short abort turns a hung backend into a fast, catchable error that
 * the data layer already degrades on (empty lists, a null region, an
 * empty filter set), so the Payload-driven parts of the site keep
 * rendering while the catalog is offline. The value is generous enough
 * that a slow-but-healthy backend still answers in time; once Render is
 * back on a paid (always-on) plan, responses arrive in well under a
 * second.
 */
export const MEDUSA_REQUEST_TIMEOUT_MS = 5000

/**
 * An abort signal that fires after MEDUSA_REQUEST_TIMEOUT_MS, or
 * `undefined` where the runtime lacks AbortSignal.timeout — in which
 * case the request keeps its previous (unbounded) behaviour rather than
 * failing to build.
 */
export function medusaTimeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(MEDUSA_REQUEST_TIMEOUT_MS)
    : undefined
}
