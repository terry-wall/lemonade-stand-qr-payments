import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const order = await prisma.order.findUnique({
      where: {
        paymentIntentId: intentId,
      },
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      paymentIntentId: order.paymentIntentId,
      items: order.items,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}