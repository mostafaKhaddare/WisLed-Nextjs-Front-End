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


/**
 * Cloudinary delivery host.
 *
 * Product and category images are hosted on Cloudinary and referenced by their
 * public HTTPS url, e.g.
 * https://res.cloudinary.com/<cloud-name>/image/upload/v1699999999/profile-led.jpg
 *
 * `next/image` 400s any absolute url whose host is missing from `remotePatterns`,
 * so without this every externally hosted catalogue image fails to render — with
 * a bare 400 and no server-side log line, which is why it is declared here rather
 * than left to be discovered.
 *
 * `res.cloudinary.com` is the same hostname for every Cloudinary account, so
 * unlike the bucket hosts above it is not derived from an env var: the cloud name
 * is a path segment, not a subdomain.
 */
remotePatterns.push({
  protocol: 'https',
  hostname: 'res.cloudinary.com',
  pathname: '/**',
})

/**
 * Supabase Storage public download host.
 *
 * Product and category images are served from Supabase Storage, whose public
 * URL is https://PROJECT_ID.supabase.co/storage/v1/object/public/BUCKET/...
 *
 * `next/image` 400s any absolute url whose host is missing from `remotePatterns`,
 * so without this every Medusa image would fail to render with a bare 400 and no
 * server-side log line — the same class of failure the bucket hosts above guard
 * against.
 *
 * The host is project-specific, so it is derived from S3_FILE_URL rather than
 * hardcoded: the public URL and the upload endpoint share the same project host,
 * just under different path prefixes. If the variable is absent or points at a
 * non-Supabase provider, nothing is added and the existing patterns apply.
 */
const supabasePublicHost = (process.env.S3_FILE_URL || '')
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '')
if (supabasePublicHost && supabasePublicHost.endsWith('.supabase.co')) {
  remotePatterns.push({
    protocol: 'https',
    hostname: supabasePublicHost,
    pathname: '/storage/v1/object/public/**',
  })
}


const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
    // AVIF is roughly 30% lighter than WebP at the same perceived quality.
    // Next only negotiates it for browsers that advertise support via Accept,
    // so older clients keep getting WebP.
    formats: ['image/avif', 'image/webp'],
    // Product images are immutable in the CMS. The 60s default re-runs the
    // optimizer on nearly every cold request, which is the slowest path on a
    // catalogue page.
    minimumCacheTTL: 60 * 60 * 24,
  },
}

// `withPayload` registers the Payload admin + REST/GraphQL routes and wires
// the `/media` static directory. It must wrap the exported config.
module.exports = withPayload(nextConfig)
