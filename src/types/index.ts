export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: number
  paymentIntentId: string
  items: CartItem[]
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'canceled'
  createdAt: string
  updatedAt: string
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  status: string
  amount: number
}