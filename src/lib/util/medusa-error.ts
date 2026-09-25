export default function medusaError(error: any): never {
  if (error?.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const requestUrl = error.config?.url || error.config?.baseURL
    console.error('Resource:', requestUrl || 'unknown')
    console.error('Response data:', error.response.data)
    console.error('Status code:', error.response.status)
    console.error('Headers:', error.response.headers)

    // Extracting the error message from the response data
    const responseData = error.response.data
    const message =
      typeof responseData === 'string'
        ? responseData
        : responseData?.message || 'Request failed'

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + '.')
  } else if (error?.request) {
    // The request was made but no response was received
    throw new Error('No response received: ' + error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(
      'Error setting up the request: ' + (error?.message || 'Unknown error')
    )
  }
}
