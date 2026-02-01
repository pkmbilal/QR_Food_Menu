'use client'

import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [restaurant, setRestaurant] = useState(null)

  // Add item to cart
  const addToCart = (item, restaurantInfo) => {
    // Store restaurant on first item added
    if (!restaurant && restaurantInfo) {
      setRestaurant(restaurantInfo)
    }
    
    setCartItems((prevItems) => {
      // Check if item already in cart
      const existingItem = prevItems.find((i) => i.id === item.id)
      
      if (existingItem) {
        // Increase quantity
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId))
  }

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setCartItems((prevItems) =>
        prevItems.map((i) =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        )
      )
    }
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    setRestaurant(null)
  }

  // Get total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Get total items count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}