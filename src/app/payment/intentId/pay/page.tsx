'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PayPage() {
  const params = useParams()
  const intentId = params.intentId as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const redirectToStripe = async () => {
      try {
        // Get the payment intent details
        const response = await fetch(`/api/payment-intent/${intentId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch payment intent')
        }
        
        const { clientSecret } = await response.json()
        const stripe = await stripePromise
        
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        // Redirect to Stripe Checkout or Payment Element
        const { error } = await stripe.redirectToCheckout({
          sessionId: clientSecret,
        })

        if (error) {
          setError(error.message || 'Payment failed')
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (intentId) {
      redirectToStripe()
    }
  }, [intentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lemon-500 mx-auto mb-4"></div>
          <p className="text-lemon-700">Redirecting to payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href={`/payment/${intentId}`} className="btn-primary">
            Back to Payment
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-lemon-800 mb-4">Processing Payment</h2>
        <p className="text-gray-600">Please wait while we redirect you to complete your payment...</p>
      </div>
    </div>
  )
}