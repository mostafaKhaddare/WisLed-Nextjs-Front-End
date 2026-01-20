'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function resetOnboardingState(orderId: string) {
  ;(await cookies()).set('_medusa_onboarding', 'false', { maxAge: -1 })
  
  // Use environment variable for admin URL to avoid hardcoded localhost
  const adminUrl = process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || 'http://localhost:7001'
  redirect(`${adminUrl}/a/orders/${orderId}`)
}
