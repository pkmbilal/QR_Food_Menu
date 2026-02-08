'use client'

import { useCart } from '@/app/CartContext'

export default function MenuItem({ item, restaurant, categoryMap = {} }) {
  const { addToCart } = useCart()

  const soldOut = !!item.is_sold_out

  const handleAddToCart = () => {
    if (soldOut) return
    addToCart(item, restaurant)
  }

  const categoryName = item.category_id
    ? categoryMap[item.category_id] || 'Uncategorized'
    : 'Uncategorized'

  return (
    <div
      className={[
        'bg-white rounded-lg shadow-md overflow-hidden transition-shadow',
        soldOut ? 'opacity-60' : 'hover:shadow-lg',
      ].join(' ')}
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative w-full h-48 overflow-hidden bg-gray-200">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />

          {/* Sold Out Pill (on image) */}
          {soldOut && (
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/90 text-gray-900 text-xs font-semibold px-3 py-1 shadow-sm border">
              Sold Out
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
          {item.categories?.name || categoryName}
        </span>

        {/* Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 hidden sm:block">
          {item.description}
        </p>

        {/* Price and Button Row */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">SAR {item.price}</span>

          <button
            className={[
              'font-bold px-3 py-2 rounded-lg transition-colors',
              soldOut
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primary hover:bg-green-600 text-white cursor-pointer',
            ].join(' ')}
            onClick={handleAddToCart}
            disabled={soldOut}
            aria-disabled={soldOut}
          >
            Add to Cart
          </button>
        </div>

        {/* Sold Out Pill (fallback if no image) */}
        {!item.image_url && soldOut && (
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 border">
              Sold Out
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
