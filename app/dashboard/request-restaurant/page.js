'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProfile, submitRestaurantRequest, getUserRequests } from '@/lib/auth'

export default function RequestRestaurantPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [existingRequests, setExistingRequests] = useState([])
  const [formData, setFormData] = useState({
    restaurantName: '',
    imageURL: '',
    phone: '',
    address: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
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

      // If already owner or admin, redirect
      if (userProfile && userProfile.role !== 'customer') {
        router.push('/dashboard')
        return
      }

      // Get existing requests
      const { data: requests } = await getUserRequests(currentUser.id)
      setExistingRequests(requests || [])

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // Validate phone number
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number')
      setSubmitting(false)
      return
    }

    try {
      const { data, error: submitError } = await submitRestaurantRequest(user.id, {
        name: formData.restaurantName,
        image_url: formData.imageURL,
        phone: formData.phone,
        address: formData.address,
        description: formData.description
      })

      if (submitError) {
        setError(submitError.message)
        setSubmitting(false)
        return
      }

      // Success!
      setSuccess(true)
      setFormData({
        restaurantName: '',
        imageURL: '',
        phone: '',
        address: '',
        description: ''
      })

      // Refresh requests list
      const { data: requests } = await getUserRequests(user.id)
      setExistingRequests(requests || [])

      setSubmitting(false)

      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        router.push('/dashboard/customer')
      }, 3000)

    } catch (err) {
      setError('Something went wrong: ' + err.message)
      setSubmitting(false)
    }
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

  // Check if user has pending request
  const hasPendingRequest = existingRequests.some(req => req.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/customer"
            className="text-primary hover:text-green-600 font-semibold mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Request to Become Owner</h1>
          <p className="text-gray-600">
            Fill out the form below to request access to manage a restaurant on our platform.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">✅ Request Submitted Successfully!</h3>
            <p className="text-sm">
              Your request has been submitted and is pending admin approval. 
              You'll be notified once it's reviewed. Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Pending Request Warning */}
        {hasPendingRequest && !success && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">⏳ Pending Request</h3>
            <p className="text-sm">
              You already have a pending request. Please wait for admin approval before submitting another request.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Restaurant Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                    placeholder="e.g., Pizza Palace"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={hasPendingRequest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The official name of your restaurant
                  </p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Image URL *
                  </label>
                  <input
                    type="text"
                    value={formData.imageURL}
                    onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
                    placeholder="e.g., https://images.pexels.com/photos/2750900/pexels-photo-2750900.jpeg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={hasPendingRequest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your restaurant image URL
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="966501234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={hasPendingRequest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., 966 for Saudi Arabia). No + or spaces.
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main Street, City, Country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={hasPendingRequest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Full address of your restaurant
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us about your restaurant, cuisine type, why you want to join our platform..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={hasPendingRequest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Help us understand your business better
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || hasPendingRequest}
                  className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? 'Submitting Request...' : 
                   hasPendingRequest ? 'Request Already Pending' : 
                   'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* What Happens Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">📋 What Happens Next?</h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Your request is submitted to our admin team</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Admin reviews your restaurant details</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>You'll be notified of approval/rejection</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Once approved, you can manage your menu!</span>
                </li>
              </ol>
            </div>

            {/* Requirements */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-900 mb-3">✅ Requirements</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Valid restaurant name</li>
                <li>• Active WhatsApp number</li>
                <li>• Physical restaurant location</li>
                <li>• Commitment to keep menu updated</li>
              </ul>
            </div>

            {/* Your Requests */}
            {existingRequests.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Your Previous Requests</h3>
                <div className="space-y-2">
                  {existingRequests.map((req) => (
                    <div key={req.id} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{req.restaurant_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}