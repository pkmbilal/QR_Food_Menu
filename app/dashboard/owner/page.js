'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProfile, getUserRestaurant, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function OwnerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadOwnerData()
  }, [router])

  async function loadOwnerData() {
    // Get current user
    const { user: currentUser, error: userError } = await getCurrentUser()

    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }

    setUser(currentUser)

    // Get profile
    const { data: userProfile } = await getUserProfile(currentUser.id)
    setProfile(userProfile)

    // Check if user is actually owner
    if (userProfile && userProfile.role !== 'owner') {
      router.push('/dashboard')
      return
    }

    // Get restaurant
    const { data: userRestaurant, error: restaurantError } = await getUserRestaurant(currentUser.id)

    if (restaurantError || !userRestaurant) {
      // Owner but no restaurant yet (shouldn't happen, but handle it)
      setLoading(false)
      return
    }

    setRestaurant(userRestaurant)

    // Get menu items
    await loadMenuItems(userRestaurant.id)

    setLoading(false)
  }

  async function loadMenuItems(restaurantId) {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', { ascending: true })

    setMenuItems(data || [])
  }

  const toggleAvailability = async (itemId, currentStatus) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentStatus })
      .eq('id', itemId)

    if (!error) {
      loadMenuItems(restaurant.id)
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (!error) {
      loadMenuItems(restaurant.id)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Restaurant Found</h1>
          <p className="text-gray-600">Please contact admin for assistance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <p className="text-gray-600">Owner Dashboard</p>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/menu/${restaurant.slug}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                View Menu
              </Link>
              <Link
                href={`/qr/${restaurant.slug}`}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Get QR Code
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Menu Items</div>
            <div className="text-3xl font-bold text-gray-800">{menuItems.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Available Items</div>
            <div className="text-3xl font-bold text-green-600">
              {menuItems.filter(item => item.is_available).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Unavailable Items</div>
            <div className="text-3xl font-bold text-red-600">
              {menuItems.filter(item => !item.is_available).length}
            </div>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Restaurant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{restaurant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">URL Slug</p>
              <p className="font-semibold">/menu/{restaurant.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">WhatsApp Number</p>
              <p className="font-semibold">{restaurant.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{restaurant.address || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Add Item Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Item'}
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <AddItemForm 
            restaurantId={restaurant.id} 
            onSuccess={() => {
              setShowAddForm(false)
              loadMenuItems(restaurant.id)
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Menu Items List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
          </div>

          <div className="divide-y">
            {menuItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No menu items yet. Add your first item!
              </div>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-6">
                    {/* Image */}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        {!item.is_available && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <p className="text-2xl font-bold text-orange-600">${item.price}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleAvailability(item.id, item.is_available)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          item.is_available
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Item Form Component
function AddItemForm({ restaurantId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    image_url: '',
    is_available: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: dbError } = await supabase
      .from('menu_items')
      .insert([{
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        is_available: formData.is_available
      }])

    if (dbError) {
      setError('Failed to add item: ' + dbError.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Add New Menu Item</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Margherita Pizza"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe your dish..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Price and Category Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="12.99"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Pizza">Pizza</option>
              <option value="Salad">Salad</option>
              <option value="Drinks">Drinks</option>
              <option value="Desserts">Desserts</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Main Course">Main Course</option>
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste image URL from Unsplash or your image host
          </p>
        </div>

        {/* Available Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_available"
            checked={formData.is_available}
            onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
            className="w-5 h-5"
          />
          <label htmlFor="is_available" className="text-sm font-semibold text-gray-700">
            Available for ordering
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}