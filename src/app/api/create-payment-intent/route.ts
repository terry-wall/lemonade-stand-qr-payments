import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { saveOrder } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Calculate total amount
    const amount = items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        items: JSON.stringify(items),
      },
    })

    // Save order to database
    await saveOrder({
      paymentIntentId: paymentIntent.id,
      items,
      amount,
      status: 'pending',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}