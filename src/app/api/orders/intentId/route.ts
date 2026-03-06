import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { intentId: string } }
) {
  try {
    const { intentId } = params
    
    if (!intentId) {
      return NextResponse.json({ error: 'Missing intent ID' }, { status: 400 })
    }

    const order = await getOrder(intentId)
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}