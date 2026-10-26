import { NextRequest, NextResponse } from 'next/server'

import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'
import {
  generateOrderConfirmationPdf,
  orderConfirmationFileName,
} from '@lib/order-confirmation/pdf'
import { ORDER_CONFIRMATION_FIELDS } from '@lib/util/order-fields'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * Customer PDF download. The order email is required as a lightweight check so
 * that knowing an order id alone is not enough to download someone else's
 * confirmation.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()

  if (!id || !email) {
    return NextResponse.json(
      { error: 'Adresse email manquante.' },
      { status: 400 }
    )
  }

  try {
    const authHeaders = await getAuthHeaders()
    const { order } = await sdk.store.order.retrieve(
      id,
      { fields: ORDER_CONFIRMATION_FIELDS },
      authHeaders
    )

    if (!order || order.email?.trim().toLowerCase() !== email) {
      return NextResponse.json(
        { error: 'Commande introuvable.' },
        { status: 404 }
      )
    }

    const pdf = await generateOrderConfirmationPdf(order)

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${orderConfirmationFileName(
          order
        )}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error(
      `[Order ${id}] Could not generate confirmation PDF download`,
      error
    )
    return NextResponse.json(
      { error: 'Impossible de générer la confirmation.' },
      { status: 500 }
    )
  }
}
