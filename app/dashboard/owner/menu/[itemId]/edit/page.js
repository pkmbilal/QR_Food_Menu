'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, getUserProfile, getUserRestaurant } from '@/lib/auth'

export default function EditMenuItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.itemId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [item, setItem] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
  })

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  async function init() {
    setLoading(true)
    setError('')

    // 1) Auth
    const { user: currentUser, error: userError } = await getCurrentUser()
    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await getUserProfile(currentUser.id)
    if (!profile || profile.role !== 'owner') {
      router.push('/dashboard')
      return
    }

    // 2) Restaurant (owner’s restaurant)
    const { data: userRestaurant, error: restErr } = await getUserRestaurant(currentUser.id)
    if (restErr || !userRestaurant) {
      setError('No restaurant found for this owner.')
      setLoading(false)
      return
    }
    setRestaurant(userRestaurant)

    // 3) Load categories
    const { data: catData, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', userRestaurant.id)
      .order('name', { ascending: true })

    if (!catErr) setCategories(catData || [])

    // 4) Load the item
    const { data: itemData, error: itemErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (itemErr || !itemData) {
      setError('Menu item not found.')
      setLoading(false)
      return
    }

    // ✅ SECURITY CHECK: make sure this item belongs to this owner’s restaurant
    if (itemData.restaurant_id !== userRestaurant.id) {
      setError('You are not allowed to edit this item.')
      setLoading(false)
      return
    }

    setItem(itemData)

    // Fill form
    setFormData({
      name: itemData.name || '',
      description: itemData.description || '',
      price: itemData.price ?? '',
      category_id: itemData.category_id || '',
      image_url: itemData.image_url || '',
      is_available: itemData.is_available ?? true,
    })

    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      image_url: formData.image_url?.trim() || null,
      is_available: !!formData.is_available,
    }

    const { error: updateErr } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', itemId)
      .eq('restaurant_id', restaurant.id) // extra safety

    if (updateErr) {
      setError(updateErr.message)
      setSaving(false)
      return
    }

    setSaving(false)
    router.push('/dashboard/owner') // back to dashboard
    router.refresh?.()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Edit Menu Item</h1>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Link href="/dashboard/owner" className="text-primary font-semibold">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Menu Item</h1>
              <p className="text-gray-500 text-sm">{item?.name}</p>
            </div>
            <Link href="/dashboard/owner" className="text-sm font-semibold text-primary">
              ← Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (SAR) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {formData.image_url && (
                <div className="mt-3">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_available"
                type="checkbox"
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
                disabled={saving}
                className="flex-1 bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                href="/dashboard/owner"
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
