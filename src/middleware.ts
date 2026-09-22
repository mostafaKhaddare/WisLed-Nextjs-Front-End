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

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Validate environment variables
    if (!BACKEND_URL) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set. Please set it in your .env file.'
        )
      }
      return regionMapCache.regionMap
    }

    if (!PUBLISHABLE_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. Please set it in your .env file.'
        )
      }
      return regionMapCache.regionMap
    }

    try {
      // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
        next: {
          revalidate: 3600,
          tags: ['regions'],
        },
      })

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `Failed to fetch regions: ${response.status} ${response.statusText}. Make sure your Medusa backend is running at ${BACKEND_URL}`
          )
        }
        // Return existing map if available, otherwise return empty map
        return regionMapCache.regionMap
      }

      const { regions } = await response.json()

      if (!regions?.length) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('No regions found in Medusa backend')
        }
        return regionMapCache.regionMap
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
      // Return existing map if available, otherwise return empty map
      return regionMapCache.regionMap
    }
  }

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
  const isAlreadyDefaultLocale =
    pathname === `/${DEFAULT_REGION}` || pathname.startsWith(`/${DEFAULT_REGION}/`)

  if (!countryCode) {
    if (isAlreadyDefaultLocale) {
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
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}
