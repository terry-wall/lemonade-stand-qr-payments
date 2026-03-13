import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { intentId: string } }
) {
  try {
    // Safely extract intentId with proper error checking
    const params = context?.params
    if (!params || !params.intentId) {
      console.error('Missing params or intentId in route context')
      return NextResponse.json({ error: 'Missing intent ID' }, { status: 400 })
    }

    const { intentId } = params
    
    if (!intentId || typeof intentId !== 'string') {
      console.error('Invalid intentId:', intentId)
      return NextResponse.json({ error: 'Invalid intent ID' }, { status: 400 })
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