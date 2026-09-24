export const getBaseURL = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl)

      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin
      }
    } catch {
      console.warn(
        '[Config] Ignoring invalid NEXT_PUBLIC_BASE_URL; using the deployment default.'
      )
    }
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://wisled.ma'
    : 'http://localhost:8000'
}
