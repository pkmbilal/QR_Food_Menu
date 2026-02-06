import { supabase } from '@/lib/supabase'
import MenuItem from '@/components/MenuItem'
import CartButton from '@/components/CartButton'
import Link from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'

import { QrCode, Phone } from "lucide-react"

export default async function MenuPage({ params }) {
  // Get the restaurant slug from the URL
  const { restaurantSlug } = await params
  
  // Fetch restaurant data
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', restaurantSlug)
    .single()  

  // If restaurant not found, show error
  if (restaurantError || !restaurant) {
    return (
      <>
      {/* Restaurant Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
              {restaurant.address && (
                <p className="text-orange-100 text-lg flex items-center gap-2">
                  <span>📍</span>
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-orange-100 text-lg flex items-center gap-2 mt-1">
                  <span>📞</span>
                  {restaurant.phone}
                </p>
              )}
            </div>
            
            {/* Favorite Button and QR Code */}
            <div className="flex gap-3">
              <FavoriteButton restaurantId={restaurant.id} />
              
              <Link
                href={`/qr/${restaurant.slug}`}
                className="bg-white text-primary hover:text-green-600 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <span><QrCode size={16} color="#00c951" /></span>
                Get QR Code
              </Link>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }

  // Fetch menu items for this restaurant
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_available', true)
    

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
              {restaurant.address && (
                <p className="text-orange-100 text-lg flex items-center gap-2">
                  <span>📍</span>
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-white text-lg flex items-center gap-2 mt-1">
                  <span><Phone size={20} color="#ffffff" /></span>
                  {restaurant.phone}
                </p>
              )}
              {/* QR Code Button */}
              <Link
                href={`/qr/${restaurant.slug}`}
                className="w-fit bg-white text-primary px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 mt-2 hover:shadow-xl"
              >
                <span><QrCode size={16} color="#00c951" /></span>
                Get QR Code
              </Link>
            </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>
        
        {menuItems && menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} restaurant={restaurant}/>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No menu items available</p>
        )}
      </div>
      {/* Floating Cart Button */}
      <CartButton />
    </div>
  )
}