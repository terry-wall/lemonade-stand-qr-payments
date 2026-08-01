import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getMenuItem, MAX_QUANTITY_PER_ITEM } from '@/lib/menu'
import { getAppUrl } from '@/lib/url'
import { CartSelection, OrderLine } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Turn the browser's `{ id, quantity }` list into priced order lines using the
 * server-side menu. Prices are never taken from the request body.
 */
function buildOrderLines(raw: unknown): OrderLine[] | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'Cart is empty' }
  }

  const lines: OrderLine[] = []

  for (const entry of raw as CartSelection[]) {
    if (!entry || typeof entry.id !== 'string') {
      return { error: 'Invalid cart entry' }
    }

    const quantity = Number(entry.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { error: `Quantity for "${entry.id}" must be between 1 and ${MAX_QUANTITY_PER_ITEM}` }
    }

    const item = getMenuItem(entry.id)
    if (!item) {
      return { error: `Unknown menu item "${entry.id}"` }
    }

    if (lines.some((line) => line.id === item.id)) {
      return { error: `Duplicate cart entry for "${entry.id}"` }
    }

    lines.push({
      id: item.id,
      name: item.name,
      quantity,
      unitPriceCents: item.priceCents,
    })
  }

  return lines
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = buildOrderLines((body as { items?: unknown })?.items)
  if (!Array.isArray(result)) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  const lines = result

  const amountCents = lines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0
  )

  try {
    const appUrl = getAppUrl()

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: line.unitPriceCents,
          product_data: { name: line.name },
        },
      })),
      // The QR code points the customer's phone at Stripe's hosted page; both
      // ends of the flow land back on our order page.
      success_url: `${appUrl}/payment/{CHECKOUT_SESSION_ID}?paid=1`,
      cancel_url: `${appUrl}/payment/{CHECKOUT_SESSION_ID}`,
    })

    await prisma.order.create({
      data: {
        checkoutSessionId: session.id,
        // Prisma's Json input type does not accept a typed array directly.
        items: lines as unknown as Prisma.InputJsonValue,
        amountCents,
        status: 'pending',
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
