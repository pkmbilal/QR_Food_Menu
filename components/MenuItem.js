'use client'

import { useCart } from '@/app/CartContext'

export default function MenuItem({ item, restaurant, categoryMap = {} }) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(item, restaurant)
  }

  const categoryName = item.category_id
    ? categoryMap[item.category_id] || 'Uncategorized'
    : 'Uncategorized'

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {item.image_url && (
        <div className="w-full h-48 overflow-hidden bg-gray-200">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
          {item.categories?.name || 'Uncategorized'}
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
            className="bg-primary hover:bg-green-600 text-white font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
