type MedusaErrorLike = {
  message?: string
  response?: {
    status?: number
    data?: { type?: string; message?: string } | string
  }
  config?: { url?: string; baseURL?: string }
}

export function logMedusaRequestError(resource: string, error: unknown) {
  const medusaError = error as MedusaErrorLike
  const responseData = medusaError.response?.data
  const backendMessage =
    typeof responseData === 'string' ? responseData : responseData?.message

  console.error('[Medusa] Store request failed', {
    resource,
    status: medusaError.response?.status,
    type: typeof responseData === 'string' ? undefined : responseData?.type,
    message: backendMessage || medusaError.message || 'Unknown error',
    url: medusaError.config?.url || medusaError.config?.baseURL,
  })
}
