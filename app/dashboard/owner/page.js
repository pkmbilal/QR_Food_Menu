'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { getCurrentUser, getUserProfile, getUserRestaurant, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function OwnerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [restaurant, setRestaurant] = useState(null)

  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)

  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadOwnerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadOwnerData() {
    setLoading(true)

    const { user: currentUser, error: userError } = await getCurrentUser()
    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)

    const { data: userProfile } = await getUserProfile(currentUser.id)
    setProfile(userProfile)

    if (userProfile && userProfile.role !== 'owner') {
      router.push('/dashboard')
      return
    }

    const { data: userRestaurant, error: restaurantError } = await getUserRestaurant(currentUser.id)
    if (restaurantError || !userRestaurant) {
      setLoading(false)
      return
    }

    setRestaurant(userRestaurant)

    await loadCategories(userRestaurant.id)
    await loadMenuItems(userRestaurant.id)

    setLoading(false)
  }

  async function loadMenuItems(restaurantId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category_id', { ascending: true })

    if (!error) setMenuItems(data || [])
  }

  async function loadCategories(restaurantId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name', { ascending: true })

    if (!error) setCategories(data || [])
  }

  const categoryMap = useMemo(() => {
    return Object.fromEntries((categories || []).map((c) => [c.id, c.name]))
  }, [categories])

  const toggleAvailability = async (itemId, currentStatus) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentStatus })
      .eq('id', itemId)

    if (!error && restaurant?.id) {
      loadMenuItems(restaurant.id)
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (!error && restaurant?.id) {
      loadMenuItems(restaurant.id)
    }
  }

  // Rename category
  const renameCategory = async (categoryId, newName) => {
    const clean = newName.trim()
    if (!clean) return { ok: false, message: 'Name cannot be empty' }

    const { error } = await supabase
      .from('categories')
      .update({ name: clean })
      .eq('id', categoryId)

    if (error) {
      const msg =
        error.message?.toLowerCase().includes('duplicate')
          ? 'This category already exists.'
          : error.message
      return { ok: false, message: msg }
    }

    await loadCategories(restaurant.id)
    return { ok: true }
  }

  // Delete category (items become Uncategorized because FK is ON DELETE SET NULL)
  const deleteCategory = async (categoryId) => {
    if (!confirm('Delete this category? Items under it will become Uncategorized.')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      alert('Failed to delete category: ' + error.message)
      return
    }

    await loadCategories(restaurant.id)
    await loadMenuItems(restaurant.id)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
          <div className="md:flex justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <p className="text-gray-600">Owner Dashboard</p>
            </div>

            <div className="flex gap-2 md:gap-4">
              <Link
                href={`/menu/${restaurant.slug}`}
                className="bg-primary hover:bg-green-600 text-sm py-1 text-white px-4 md:py-2 rounded-2xl font-semibold transition-colors"
              >
                View Menu
              </Link>

              <Link
                href={`/qr/${restaurant.slug}`}
                className="bg-primary hover:bg-green-600 text-sm py-1 text-white px-4 md:py-2 rounded-2xl font-semibold transition-colors"
              >
                Get QR Code
              </Link>

              <Link
                href="/dashboard/owner/restaurant/edit"
                className="bg-primary hover:bg-green-600 text-sm py-1 text-white px-4 md:py-2 rounded-2xl font-semibold transition-colors"
              >
                Edit Restaurant
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-sm py-1 text-white px-4 md:py-2 rounded-2xl font-semibold transition-colors"
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
              {menuItems.filter((item) => item.is_available).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Unavailable Items</div>
            <div className="text-3xl font-bold text-red-600">
              {menuItems.filter((item) => !item.is_available).length}
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

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <button
              onClick={() => {
                setShowAddCategoryForm((s) => !s)
                if (!showAddCategoryForm) setShowAddItemForm(false)
              }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {showAddCategoryForm ? '✕ Close' : '+ Add Category'}
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories yet. Add your first category.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  category={c}
                  onRename={renameCategory}
                  onDelete={() => deleteCategory(c.id)}
                />
              ))}
            </div>
          )}
        </div>

        {showAddCategoryForm && (
          <AddCategoryForm
            restaurantId={restaurant.id}
            onSuccess={async () => {
              setShowAddCategoryForm(false)
              await loadCategories(restaurant.id)
            }}
            onCancel={() => setShowAddCategoryForm(false)}
          />
        )}

        {/* Add Item */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => {
              setShowAddItemForm((s) => !s)
              if (!showAddItemForm) setShowAddCategoryForm(false)
            }}
            className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            {showAddItemForm ? '✕ Cancel' : '+ Add New Item'}
          </button>
        </div>

        {showAddItemForm && (
          <AddItemForm
            restaurantId={restaurant.id}
            categories={categories}
            onSuccess={async () => {
              setShowAddItemForm(false)
              await loadMenuItems(restaurant.id)
            }}
            onCancel={() => setShowAddItemForm(false)}
          />
        )}

        {/* Menu Items */}
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
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>

                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          {categoryMap[item.category_id] || 'Uncategorized'}
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

/* ---------------- Category Chip (Lucide icons) ---------------- */
function CategoryChip({ category, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(category.name)
  }, [category.name])

  const save = async () => {
    setError('')
    setSaving(true)

    const res = await onRename(category.id, name)

    setSaving(false)

    if (!res?.ok) {
      setError(res?.message || 'Failed to rename')
      return
    }

    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
      {!editing ? (
        <>
          <span className="text-sm">{category.name}</span>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/70 transition"
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-full text-red-600 hover:text-red-800 hover:bg-white/70 transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-32 text-sm px-2 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            autoFocus
          />

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="p-1 rounded-full text-green-700 hover:text-green-900 hover:bg-white/70 transition disabled:opacity-50"
            title="Save"
          >
            <Check className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setName(category.name)
              setError('')
            }}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/70 transition"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}

      {error && <span className="text-xs text-red-600 ml-1">{error}</span>}
    </div>
  )
}

/* ---------------- Add Category Form ---------------- */
function AddCategoryForm({ restaurantId, onSuccess, onCancel }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanName = name.trim()

    const { error: dbError } = await supabase
      .from('categories')
      .insert([{ restaurant_id: restaurantId, name: cleanName }])

    if (dbError) {
      const msg =
        dbError.message?.toLowerCase().includes('duplicate')
          ? 'This category already exists.'
          : dbError.message
      setError('Failed to add category: ' + msg)
      setLoading(false)
      return
    }

    setLoading(false)
    setName('')
    onSuccess?.()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Add New Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Biriyani"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Category'}
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

/* ---------------- Add Item Form ---------------- */
function AddItemForm({ restaurantId, categories, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: dbError } = await supabase.from('menu_items').insert([
      {
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url,
        is_available: formData.is_available,
      },
    ])

    if (dbError) {
      setError('Failed to add item: ' + dbError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess?.()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Add New Menu Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Margherita Pizza"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your dish..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (SAR) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="12.99"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No categories yet. Add a category first.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste image URL from Unsplash or your image host
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_available"
            checked={formData.is_available}
            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            className="w-5 h-5"
          />
          <label htmlFor="is_available" className="text-sm font-semibold text-gray-700">
            Available for ordering
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="flex-1 bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
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
