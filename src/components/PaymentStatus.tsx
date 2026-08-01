import Link from 'next/link'
import { OrderStatus } from '@/types'

interface PaymentStatusProps {
  status: OrderStatus
}

const DISPLAY: Record<
  OrderStatus,
  { color: string; bgColor: string; icon: string; message: string; description: string }
> = {
  completed: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '✅',
    message: 'Payment Successful!',
    description: 'Thank you for your purchase. Your lemonade will be ready shortly!',
  },
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '⏰',
    message: 'Waiting for Payment',
    description: 'Scan the QR code or use the payment link to complete your purchase.',
  },
  failed: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '❌',
    message: 'Payment Failed',
    description: 'The payment did not go through. You can try ordering again.',
  },
  expired: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '🕒',
    message: 'Checkout Expired',
    description: 'This payment link is no longer valid. Please start a new order.',
  },
}

export default function PaymentStatus({ status }: PaymentStatusProps) {
  const display = DISPLAY[status] ?? DISPLAY.pending

  return (
    <div className={`card ${display.bgColor} border-l-4 border-current`}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{display.icon}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${display.color}`}>{display.message}</h3>
          <p className="text-sm text-gray-600 mt-1">{display.description}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className={status === 'completed' ? 'btn-primary' : 'btn-secondary'}>
          {status === 'completed' ? 'Order More Lemonade' : 'Back to Menu'}
        </Link>
      </div>
    </div>
  )
}
