import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

import { getMedusaBackendUrl } from './lib/medusa-env'

const BACKEND_URL = getMedusaBackendUrl(process.env)
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = "ma"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

// A slow backend (e.g. a cold Render instance) must never stall the
// middleware: Vercel kills edge invocations that run too long and
// answers with MIDDLEWARE_INVOCATION_TIMEOUT. The abort turns a
// hang into a fast fallback to the cached region map.
const REGION_FETCH_TIMEOUT_MS = 3000

let inFlightRefresh: Promise<void> | null = null

async function refreshRegionMap() {
  // Validate environment variables
  if (!BACKEND_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set. Please set it in your .env file.'
      )
    }
    return
  }

  if (!PUBLISHABLE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. Please set it in your .env file.'
      )
    }
    return
  }

  try {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      signal:
        typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(REGION_FETCH_TIMEOUT_MS)
          : undefined,
    })

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `Failed to fetch regions: ${response.status} ${response.statusText}. Make sure your Medusa backend is running at ${BACKEND_URL}`
        )
      }
      return
    }

    const { regions } = await response.json()

    if (!regions?.length) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('No regions found in Medusa backend')
      }
      return
    }

    // Clear existing map before populating
    regionMapCache.regionMap.clear()

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? '', region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `Error fetching regions from ${BACKEND_URL}:`,
        error instanceof Error ? error.message : 'Unknown error'
      )
      console.error(
        'Make sure your Medusa backend is running and accessible. The middleware will use cached regions if available.'
      )
    }
  }
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  const isStale =
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000

  if (!isStale) {
    return regionMapCache.regionMap
  }

  // Single-flight: concurrent requests after a cache expiry share one
  // refresh instead of stampeding the backend with parallel fetches.
  if (!inFlightRefresh) {
    inFlightRefresh = refreshRegionMap().finally(() => {
      inFlightRefresh = null
    })
  }

  await inFlightRefresh

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get('x-vercel-ip-country')
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split('/')[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?'
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const cartId = searchParams.get('cart_id')
  const checkoutStep = searchParams.get('step')
  const onboardingCookie = request.cookies.get('_medusa_onboarding')
  const cartIdCookie = request.cookies.get('_medusa_cart_id')

  let regionMap: Map<string, HttpTypes.StoreRegion>
  try {
    regionMap = await getRegionMap()
  } catch (error) {
    // If region map fails, try to continue with default region
    regionMap = new Map()
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))
  const pathname = request.nextUrl.pathname
  const firstPathSegment = pathname.split('/')[1]?.toLowerCase()
  const isCountryPath = Boolean(firstPathSegment && /^[a-z]{2}$/.test(firstPathSegment))
  const isAlreadyDefaultLocale =
    pathname === `/${DEFAULT_REGION}` || pathname.startsWith(`/${DEFAULT_REGION}/`)

  // Keep the default storefront at `/` while resolving the existing
  // country-scoped route internally.
  if (
    !isAlreadyDefaultLocale &&
    !isCountryPath &&
    (!firstPathSegment || !regionMap.has(firstPathSegment))
  ) {
    const localizedUrl = request.nextUrl.clone()
    localizedUrl.pathname = `/${DEFAULT_REGION}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(localizedUrl)
  }

  if (!countryCode) {
    if (isAlreadyDefaultLocale || isCountryPath) {
      return NextResponse.next()
    }

    const fallbackPath = pathname === '/' ? '' : pathname
    const redirectUrl = `${request.nextUrl.origin}/${DEFAULT_REGION}${fallbackPath}${request.nextUrl.search}`
    return NextResponse.redirect(redirectUrl, 307)
  }

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split('/')[1].includes(countryCode)

  // check if one of the country codes is in the url
  if (
    urlHasCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ''

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    redirectUrl = `${redirectUrl}&step=address`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set('_medusa_cart_id', cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    response.cookies.set('_medusa_onboarding', 'true', {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  // `payload` and `payload-admin` must stay out of the region middleware.
  // Otherwise `/payload-admin` gets rewritten to `/ma/payload-admin` by the
  // storefront locale logic below and the CMS admin cannot load.
  // `_next/image` is excluded too: asset requests need no region rewrite,
  // and every middleware invocation spends edge execution budget.
  //
  // `sitemap.xml`, `robots.txt` and any other `.xml` route are excluded for the
  // same reason as `payload-admin`: they are root-level endpoints with no
  // country segment, so the locale rewrite below would turn
  // `/sitemap.xml` into a 404 at `/ma/sitemap.xml` and Google would see a
  // failing sitemap.
  matcher: [
    '/((?!api|payload|payload-admin|_next/static|_next/image|favicon.ico|robots.txt|.*\\.xml).*)',
  ],
}
