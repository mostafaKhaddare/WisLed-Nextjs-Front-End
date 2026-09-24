const checkEnvVariables = require('./check-env-variables')

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

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
}

module.exports = nextConfig
