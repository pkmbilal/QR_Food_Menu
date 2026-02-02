'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function EditProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [router])

  async function loadUserData() {
    // Get current user
    const { user: currentUser, error: userError } = await getCurrentUser()

    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }

    setUser(currentUser)

    // Get profile
    const { data: userProfile } = await getUserProfile(currentUser.id)
    
    if (userProfile) {
      setProfile(userProfile)
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      // Update user profile
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      // Success!
      setSuccess(true)
      setProfile(data)

      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/customer')
      }, 2000)

    } catch (err) {
      setError('Something went wrong: ' + err.message)
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/customer"
            className="text-orange-600 hover:text-orange-700 font-semibold mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">✅ Profile Updated Successfully!</h3>
            <p className="text-sm">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., 966501234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., 966 for Saudi Arabia)
              </p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  profile?.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {profile?.role || 'customer'}
                </span>
                <span className="text-sm text-gray-500">
                  {profile?.role === 'customer' && 'Want to manage a restaurant? Request owner access!'}
                  {profile?.role === 'owner' && 'You can manage restaurants'}
                  {profile?.role === 'admin' && 'Full system access'}
                </span>
              </div>
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
                disabled={saving || success}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
              </button>
              <Link
                href="/dashboard/customer"
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 Account Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <span className="font-semibold">Account Created:</span>{' '}
              {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Last Updated:</span>{' '}
              {profile?.updated_at && new Date(profile.updated_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Account Status:</span>{' '}
              <span className={profile?.is_active ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                {profile?.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}