import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@/types'

export const dynamic = 'force-dynamic'
// Signature verification needs the raw body, which the Node runtime preserves.
export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Move an order to a terminal state. `updateMany` is deliberate: it is a no-op
 * for unknown sessions instead of throwing, and the `completed` guard keeps a
 * late `expired` event from undoing a successful payment.
 */
async function setOrderStatus(sessionId: string, status: OrderStatus) {
  const { count } = await prisma.order.updateMany({
    where: { checkoutSessionId: sessionId, status: { not: 'completed' } },
    data: { status },
  })

  if (count === 0) {
    console.warn(`Webhook for session ${sessionId} matched no updatable order`)
  }
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set; refusing to process webhooks')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const body = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        // `completed` fires for delayed payment methods too; only mark paid ones.
        if (
          session.payment_status === 'paid' ||
          session.payment_status === 'no_payment_required'
        ) {
          await setOrderStatus(session.id, 'completed')
          console.log('Payment succeeded for session:', session.id)
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        await setOrderStatus(session.id, 'failed')
        console.log('Payment failed for session:', session.id)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await setOrderStatus(session.id, 'expired')
        console.log('Checkout expired for session:', session.id)
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    // Returning 500 asks Stripe to retry, which is what we want for a transient
    // database failure. The handlers above are idempotent, so replays are safe.
    console.error('Webhook handler failed:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
