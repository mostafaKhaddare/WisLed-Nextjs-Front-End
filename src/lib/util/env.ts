export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://wisled.ma'
    : 'http://localhost:8000'
}
