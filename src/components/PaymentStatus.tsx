'use client'

import { useEffect, useState } from 'react'

interface PaymentStatusProps {
  paymentIntentId: string
}

export default function PaymentStatus({ paymentIntentId }: PaymentStatusProps) {
  const [status, setStatus] = useState<string>('requires_payment_method')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment-intent/${paymentIntentId}`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      } finally {
        setLoading(false)
      }
    }

    // Check immediately
    checkPaymentStatus()

    // Then check every 3 seconds
    const interval = setInterval(checkPaymentStatus, 3000)

    return () => clearInterval(interval)
  }, [paymentIntentId])

  const getStatusDisplay = () => {
    switch (status) {
      case 'succeeded':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅',
          message: 'Payment Successful!',
          description: 'Thank you for your purchase. Your lemonade will be ready shortly!'
        }
      case 'processing':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '⏳',
          message: 'Processing Payment...',
          description: 'Please wait while we process your payment.'
        }
      case 'requires_payment_method':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '⏰',
          message: 'Waiting for Payment',
          description: 'Please scan the QR code or use the payment link to complete your purchase.'
        }
      case 'canceled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '❌',
          message: 'Payment Canceled',
          description: 'The payment was canceled. You can try again or return to the menu.'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '⏳',
          message: 'Checking Status...',
          description: 'Please wait while we check your payment status.'
        }
    }
  }

  if (loading) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lemon-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking payment status...</p>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className={`card ${statusDisplay.bgColor} border-l-4 border-current`}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{statusDisplay.icon}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${statusDisplay.color}`}>
            {statusDisplay.message}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {statusDisplay.description}
          </p>
        </div>
      </div>
      
      {status === 'succeeded' && (
        <div className="mt-6 text-center">
          <a href="/" className="btn-primary">
            Order More Lemonade
          </a>
        </div>
      )}
      
      {(status === 'canceled' || status === 'requires_payment_method') && (
        <div className="mt-6 text-center space-x-4">
          <a href="/" className="btn-secondary">
            Back to Menu
          </a>
        </div>
      )}
    </div>
  )
}