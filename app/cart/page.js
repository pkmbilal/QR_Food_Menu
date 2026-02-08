'use client'

import { useCart } from '@/app/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { cartItems, restaurant, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart()

  // DEBUG: Check what we have
  console.log('=== CART PAGE DEBUG ===')
  console.log('Restaurant object:', restaurant)
  console.log('Restaurant phone:', restaurant?.phone)
  
  // Use real restaurant phone or fallback
  const restaurantPhone = restaurant?.phone || '1234567890'

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          <Link 
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold inline-block"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    let message = "🍕 *New Order*\n\n"
    
    if (restaurant) {
      message += `📍 *Restaurant:* ${restaurant.name}\n\n`
    }
    
    cartItems.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`
    })
    
    message += `\n*Total: $${totalPrice.toFixed(2)}*`
    
    return encodeURIComponent(message)
  }

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
            {restaurant && (
              <p className="text-gray-600 text-sm mt-1">Ordering from: {restaurant.name}</p>
            )}
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-semibold"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
              {/* Image */}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}

              {/* Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">SAR {item.price.toFixed(2)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right w-24">
                <p className="font-bold text-gray-800">
                  SAR {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">Total Items:</span>
            <span className="text-lg font-bold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold border-t pt-4">
            <span>Total:</span>
            <span className="text-orange-600">SAR {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={restaurant ? `/menu/${restaurant.slug}` : '/'}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-lg font-semibold text-center transition-colors"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleWhatsAppOrder}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>📱</span>
            Order via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}