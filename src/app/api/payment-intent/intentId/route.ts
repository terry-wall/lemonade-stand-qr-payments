import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { intentId: string } }
) {
  try {
    // Handle the case where params might be a Promise in newer Next.js versions
    const params = await Promise.resolve(context.params)
    const { intentId } = params
    
    if (!intentId) {
      return NextResponse.json({ error: 'Missing intent ID' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(intentId)
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    })
  } catch (error: any) {
    console.error('Error fetching payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment intent' },
      { status: 500 }
    )
  }
}