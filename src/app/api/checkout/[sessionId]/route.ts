import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { OrderLine, OrderStatus } from '@/types'

export const dynamic = 'force-dynamic'

/** Stripe session ids look like `cs_test_a1B2...`; reject anything else early. */
const SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]+$/

function statusFromSession(
  session: { status: string | null; payment_status: string }
): OrderStatus {
  if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
    return 'completed'
  }
  if (session.status === 'expired') return 'expired'
  return 'pending'
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { checkoutSessionId: sessionId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // The webhook is the source of truth, but polling Stripe directly keeps the
    // page responsive when webhook delivery lags or is not configured locally.
    let status = order.status as OrderStatus
    let checkoutUrl: string | null = null

    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      checkoutUrl = session.url
      const liveStatus = statusFromSession(session)

      if (liveStatus !== status) {
        status = liveStatus
        await prisma.order.updateMany({
          where: { checkoutSessionId: sessionId, status: { not: 'completed' } },
          data: { status },
        })
      }
    } catch (error) {
      // A Stripe outage should not blank out the page; fall back to stored state.
      console.error('Could not refresh checkout session from Stripe:', error)
    }

    return NextResponse.json({
      order: {
        id: order.id,
        checkoutSessionId: order.checkoutSessionId,
        items: order.items as unknown as OrderLine[],
        amountCents: order.amountCents,
        status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      checkoutUrl,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
