export interface MenuItem {
  id: string
  name: string
  description: string
  /** Unit price in cents. Money is never represented as a float. */
  priceCents: number
  image: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

/** What the browser is allowed to send us: an item id and how many. Never a price. */
export interface CartSelection {
  id: string
  quantity: number
}

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'expired'

export interface OrderLine {
  id: string
  name: string
  quantity: number
  unitPriceCents: number
}

export interface Order {
  id: string
  checkoutSessionId: string
  items: OrderLine[]
  amountCents: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

/** Payload returned by GET /api/checkout/[sessionId]. */
export interface CheckoutStatus {
  order: Order
  checkoutUrl: string | null
}
