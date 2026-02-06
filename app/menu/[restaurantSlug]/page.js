import { supabase } from '@/lib/supabase'
import MenuItem from '@/components/MenuItem'
import CartButton from '@/components/CartButton'
import Link from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'
import { QrCode, Phone } from 'lucide-react'

export default async function MenuPage({ params }) {
  // ✅ keep your style: params awaited
  const { restaurantSlug: rawSlug } = await params
  const restaurantSlug = decodeURIComponent(rawSlug || '').trim()

  // Fetch restaurant data
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', restaurantSlug)
    .single()

  // ✅ If restaurant not found, don't reference restaurant fields
  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Restaurant not found</h1>
          <p className="text-gray-600">Slug: <span className="font-mono">{restaurantSlug}</span></p>
        </div>
      </div>
    )
  }

  // ✅ Choice 2: join category name
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*, categories(name)')
    .eq('restaurant_id', restaurant.id)
    .eq('is_available', true)

  const safeMenuItems = !menuError && Array.isArray(menuItems) ? menuItems : []

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

            <div className="flex items-center gap-3 mt-3">
              <FavoriteButton restaurantId={restaurant.id} />

              <Link
                href={`/qr/${restaurant.slug}`}
                className="w-fit bg-white text-primary px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:shadow-xl"
              >
                <span><QrCode size={16} color="#00c951" /></span>
                Get QR Code
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>

        {safeMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeMenuItems.map((item) => (
              <MenuItem key={item.id} item={item} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No menu items available</p>
        )}
      </div>

      <CartButton />
    </div>
  )
}
