import { HttpTypes } from '@medusajs/types'

/**
 * A cart can contain sessions from providers that were selected previously.
 * The session that is safe to use is the latest pending one, not necessarily
 * the first item in the collection.
 */
export const findActivePaymentSession = (
  sessions?: HttpTypes.StorePaymentSession[] | null
) => {
  if (!sessions?.length) {
    return undefined
  }

  for (let index = sessions.length - 1; index >= 0; index -= 1) {
    if (sessions[index]?.status === 'pending') {
      return sessions[index]
    }
  }

  return undefined
}
