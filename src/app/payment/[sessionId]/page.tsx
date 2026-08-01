'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PaymentStatus from '@/components/PaymentStatus'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { formatCents } from '@/lib/menu'
import { CheckoutStatus } from '@/types'

const POLL_INTERVAL_MS = 3000

export default function PaymentPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId

  const [checkout, setCheckout] = useState<CheckoutStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCheckout = useCallback(async () => {
    const response = await fetch(`/api/checkout/${sessionId}`)
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Order not found' : 'Failed to load order')
    }
    return (await response.json()) as CheckoutStatus
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const data = await fetchCheckout()
        if (cancelled) return
        setCheckout(data)
        setError(null)
        // Stop polling once the order reaches a terminal state.
        if (data.order.status === 'pending') {
          timer = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId, fetchCheckout])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lemon-500 mx-auto mb-4" />
          <p className="text-lemon-700">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Link href="/" className="btn-primary">
            Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  const { order, checkoutUrl } = checkout
  const isPending = order.status === 'pending'

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-lemon-800 mb-2">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-lemon-600">
            {isPending
              ? 'Scan the QR code below to complete your payment'
              : 'This order is no longer awaiting payment'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCents(order.amountCents)}</span>
              </div>
            </div>
          </div>

          {isPending && checkoutUrl && (
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Payment QR Code</h2>
              <QRCodeGenerator data={checkoutUrl} size={200} />
              <p className="text-sm text-gray-600 mt-4">
                Scan with your phone to pay securely with Stripe
              </p>
              <div className="mt-4">
                <a
                  href={checkoutUrl}
                  className="btn-secondary inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Payment Link
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <PaymentStatus status={order.status} />
        </div>
      </div>
    </main>
  )
}
