'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProfile, getUserRestaurant } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function EditRestaurantPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    image_url: '',
    is_active: true,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)

    const { user: currentUser, error: userError } = await getCurrentUser()
    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }

    const { data: userProfile } = await getUserProfile(currentUser.id)
    if (!userProfile || userProfile.role !== 'owner') {
      router.push('/dashboard')
      return
    }

    const { data: userRestaurant, error: restaurantError } = await getUserRestaurant(currentUser.id)
    if (restaurantError || !userRestaurant) {
      setError('No restaurant found for this owner. Please contact admin.')
      setLoading(false)
      return
    }

    setRestaurant(userRestaurant)
    setFormData({
      name: userRestaurant.name || '',
      phone: userRestaurant.phone || '',
      address: userRestaurant.address || '',
      image_url: userRestaurant.image_url || '',
      is_active: userRestaurant.is_active ?? true,
    })

    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!restaurant) return

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      image_url: formData.image_url.trim(),
      is_active: formData.is_active,
    }

    const { data, error: dbError } = await supabase
      .from('restaurants')
      .update(payload)
      .eq('id', restaurant.id)
      .select()
      .single()

    if (dbError) {
      setError('Failed to update: ' + dbError.message)
      setSaving(false)
      return
    }

    setSuccess('Saved ✅')
    setSaving(false)

    setTimeout(() => {
      router.push('/dashboard/owner')
    }, 700)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Restaurant</h1>
            <p className="text-gray-600">Update your restaurant details</p>
          </div>

          <Link
            href="/dashboard/owner"
            className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 font-semibold"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              {!!formData.image_url?.trim() && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <img
                    src={formData.image_url}
                    alt="Restaurant preview"
                    className="w-full h-44 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                Restaurant is active (visible to customers)
              </label>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/owner')}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
