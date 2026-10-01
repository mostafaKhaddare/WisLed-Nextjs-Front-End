const checkEnvVariables = require('./check-env-variables')
const { withPayload } = require('@payloadcms/next/withPayload')

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '1337',
    pathname: '/uploads/**',
  },
  {
    protocol: 'https',
    hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
  },
  {
    protocol: 'https',
    hostname: 'medusa-server-testing.s3.amazonaws.com',
  },
  {
    protocol: 'https',
    hostname: 'medusa-server-testing.s3.us-east-1.amazonaws.com',
  },
]

function isValidHostname(value) {
  return Boolean(
    value &&
      !value.includes('YOUR_') &&
      !value.includes('your_') &&
      !value.includes('your-') &&
      !value.includes('://') &&
      !value.includes('/')
  )
}

if (isValidHostname(process.env.NEXT_PUBLIC_SPACE_DOMAIN)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_SPACE_DOMAIN,
  })
}

if (isValidHostname(process.env.NEXT_PUBLIC_CDN_SPACE_DOMAIN)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_CDN_SPACE_DOMAIN,
  })
}

if (isValidHostname(process.env.NEXT_PUBLIC_SPACE_ENDPOINT)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_SPACE_ENDPOINT,
  })
}

/**
 * Payload media in production is served from the object-storage bucket.
 * `next/image` refuses to optimize any host absent from `remotePatterns`, so
 * without this every CMS image 400s once the S3 adapter is active.
 *
 * S3_ENDPOINT is a URL, so strip the scheme before reusing the helper above.
 */
const s3EndpointHost = (process.env.S3_ENDPOINT || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '')
if (isValidHostname(s3EndpointHost)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: s3EndpointHost,
  })
}

/**
 * Payload's own origin has to be allowlisted as well.
 *
 * Once NEXT_PUBLIC_SERVER_URL is set — which it must be, or the admin panel
 * cannot reach the API — Payload hands out *absolute* media URLs on this site's
 * own host, e.g. https://www.wisled.ma/api/media/file/s60-8.png.
 *
 * `next/image` classifies any absolute URL as remote and 400s every one whose
 * host is absent from `remotePatterns`. Because the CMS image URL is also the
 * site origin, the failure is invisible in dev (localhost is already listed)
 * and takes out every CMS image in production at once, with a bare 400 and no
 * server-side log line.
 *
 * Derived from the env var rather than hardcoded so it tracks whichever host
 * the deployment actually uses.
 */
for (const candidate of [process.env.NEXT_PUBLIC_SERVER_URL, 'https://www.wisled.ma', 'https://wisled.ma']) {
  const host = (candidate || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (isValidHostname(host) && !remotePatterns.some((p) => p.hostname === host)) {
    remotePatterns.push({
      protocol: 'https',
      hostname: host,
    })
  }
}


const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
}

// `withPayload` registers the Payload admin + REST/GraphQL routes and wires
// the `/media` static directory. It must wrap the exported config.
module.exports = withPayload(nextConfig)
