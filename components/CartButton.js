'use client'

import { useCart } from '@/app/CartContext'
import Link from 'next/link'

export default function CartButton() {
  const { totalItems } = useCart()

  if (totalItems === 0) return null

  return (
    <Link href="/cart">
      <div className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer transition-all hover:scale-110">
        <div className="relative">
          <span className="text-2xl">🛒</span>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </div>
      </div>
    </Link>
  )
}