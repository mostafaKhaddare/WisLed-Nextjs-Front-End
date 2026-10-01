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

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
}

// `withPayload` registers the Payload admin + REST/GraphQL routes and wires
// the `/media` static directory. It must wrap the exported config.
module.exports = withPayload(nextConfig)
