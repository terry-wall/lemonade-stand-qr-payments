import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET(
  request: NextRequest,
  { params }: { params: { intentId: string } }
) {
  try {
    const { intentId } = params
    
    if (!intentId) {
      return NextResponse.json({ error: 'Missing intent ID' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(intentId)
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    console.error('Error fetching payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment intent' },
      { status: 500 }
    )
  }
}