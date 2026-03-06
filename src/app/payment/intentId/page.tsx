'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PaymentStatus from '@/components/PaymentStatus'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { Order } from '@/types'

export default function PaymentPage() {
  const params = useParams()
  const intentId = params.intentId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${intentId}`)
        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
        } else {
          setError('Order not found')
        }
      } catch (err) {
        setError('Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }

    if (intentId) {
      fetchOrder()
    }
  }, [intentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lemon-500 mx-auto mb-4"></div>
          <p className="text-lemon-700">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <a href="/" className="btn-primary">
            Back to Menu
          </a>
        </div>
      </div>
    )
  }

  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${intentId}/pay`

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-lemon-800 mb-2">
            Payment for Order #{intentId.slice(-8)}
          </h1>
          <p className="text-lemon-600">
            Scan the QR code below to complete your payment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card text-center">
            <h2 className="text-xl font-semibold mb-4">Payment QR Code</h2>
            <QRCodeGenerator data={paymentUrl} size={200} />
            <p className="text-sm text-gray-600 mt-4">
              Scan with your phone to pay securely with Stripe
            </p>
            <div className="mt-4">
              <a
                href={paymentUrl}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Payment Link
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PaymentStatus paymentIntentId={intentId} />
        </div>
      </div>
    </main>
  )
}