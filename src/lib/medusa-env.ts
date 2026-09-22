export const DEFAULT_RENDER_MEDUSA_URL = 'https://wisled-medusa-back-end-1.onrender.com'

const LOCALHOST_URLS = new Set([
  'http://localhost:9000',
  'https://localhost:9000',
  'http://127.0.0.1:9000',
  'https://127.0.0.1:9000',
])

function normalizeMedusaUrl(url?: string) {
  if (!url) return url
  return url.trim().replace(/\/+$/, '')
}

export function getMedusaBackendUrl(env: Record<string, string | undefined> = process.env) {
  const configuredUrl = normalizeMedusaUrl(env?.NEXT_PUBLIC_MEDUSA_BACKEND_URL)

  if (configuredUrl && !LOCALHOST_URLS.has(configuredUrl)) {
    return configuredUrl
  }

  if (env?.NODE_ENV === 'production') {
    return DEFAULT_RENDER_MEDUSA_URL
  }

  return configuredUrl || 'http://localhost:9000'
}
