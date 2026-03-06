'use client'

import { useState } from 'react'
import { MenuItem, CartItem } from '@/types'

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Lemonade',
    description: 'Fresh squeezed lemons with the perfect balance of sweet and tart',
    price: 3.50,
    image: '🍋'
  },
  {
    id: '2',
    name: 'Pink Lemonade',
    description: 'Our classic lemonade with a splash of cranberry for color and flavor',
    price: 4.00,
    image: '🌸'
  },
  {
    id: '3',
    name: 'Mint Lemonade',
    description: 'Refreshing lemonade infused with fresh mint leaves',
    price: 4.50,
    image: '🌿'
  },
  {
    id: '4',
    name: 'Strawberry Lemonade',
    description: 'Sweet strawberries blended with our classic lemonade',
    price: 5.00,
    image: '🍓'
  }
]

export default function LemonadeMenu() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId)
      }
    })
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      })
      
      if (response.ok) {
        const { paymentIntentId } = await response.json()
        window.location.href = `/payment/${paymentIntentId}`
      } else {
        alert('Failed to create payment. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
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
                <div className="text-4xl mb-2">{item.image}</div>
                <h3 className="text-xl font-semibold text-lemon-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-lemon-600">${item.price.toFixed(2)}</span>
                <button
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
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-lemon-200 flex items-center justify-center hover:bg-lemon-300"
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
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
                
                <button
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