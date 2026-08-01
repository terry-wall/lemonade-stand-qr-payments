'use client'

import { useState } from 'react'
import { formatCents, menuItems, MAX_QUANTITY_PER_ITEM } from '@/lib/menu'
import { MenuItem, CartItem } from '@/types'

export default function LemonadeMenu() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (!existingItem) {
        return [...prevCart, { ...item, quantity: 1 }]
      }
      if (existingItem.quantity >= MAX_QUANTITY_PER_ITEM) {
        return prevCart
      }
      return prevCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const totalCents = cart.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  )

  const handleCheckout = async () => {
    if (cart.length === 0 || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only ids and quantities: the server prices the order itself.
        body: JSON.stringify({
          items: cart.map(({ id, quantity }) => ({ id, quantity })),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || 'Failed to create payment. Please try again.')
        setIsLoading(false)
        return
      }

      // Leave the button disabled while the browser navigates away.
      window.location.href = `/payment/${data.sessionId}`
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Menu Items */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-lemon-800 mb-6">Fresh Lemonades</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="card hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2" aria-hidden="true">
                  {item.image}
                </div>
                <h3 className="text-xl font-semibold text-lemon-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-lemon-600">
                  {formatCents(item.priceCents)}
                </span>
                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  className="btn-primary"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <div className="card sticky top-8">
          <h2 className="text-2xl font-bold text-lemon-800 mb-6">Your Order</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCents(item.priceCents)} each
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove one ${item.name}`}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                        aria-label={`Add one ${item.name}`}
                        className="w-8 h-8 rounded-full bg-lemon-200 flex items-center justify-center hover:bg-lemon-300 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-lemon-600">
                    {formatCents(totalCents)}
                  </span>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600 mb-3">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Checkout with QR Code'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
