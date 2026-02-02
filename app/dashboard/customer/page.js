'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProfile, signOut, getUserFavorites, getUserRequests, removeFromFavorites } from '@/lib/auth'

export default function CustomerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
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
      setProfile(userProfile)

      // Check if user is actually a customer
      if (userProfile && userProfile.role !== 'customer') {
        // Redirect to their correct dashboard
        router.push(`/dashboard/${userProfile.role}`)
        return
      }

      // Get favorites
      const { data: userFavorites } = await getUserFavorites(currentUser.id)
      setFavorites(userFavorites || [])

      // Get restaurant requests
      const { data: userRequests } = await getUserRequests(currentUser.id)
      setRequests(userRequests || [])

      setLoading(false)
    }

    loadUserData()
  }, [router])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="hidden sm:block sm:text-3xl font-bold text-gray-800">
                Welcome, {profile?.full_name || 'User'}! 👋
              </h1>
              <h1 className="block sm:hidden text-2xl sm:text-3xl font-bold text-gray-800">
                Welcome, 
                {profile?.full_name || 'User'}! 👋
              </h1>
              <p className="text-gray-600">Customer Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{profile?.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                    {profile?.role}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold cursor-pointer">
                Edit Profile
              </button>
            </div>

            {/* Become Owner Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Own a Restaurant?</h2>
              <p className="text-orange-100 text-sm mb-4">
                Join our platform and manage your restaurant's digital menu!
              </p>
              <Link
                href="/dashboard/request-restaurant"
                className="block w-full bg-white text-orange-600 py-2 rounded-lg font-semibold text-center hover:bg-orange-50 transition-colors"
              >
                Request to Become Owner
              </Link>
            </div>
          </div>

          {/* Right Column - Favorites & Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant Requests */}
            {requests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Restaurant Requests</h2>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{request.restaurant_name}</h3>
                          <p className="text-sm text-gray-600">{request.phone}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
                          <strong>Reason:</strong> {request.rejection_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Restaurants */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Favorite Restaurants</h2>
              
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">❤️</div>
                  <p className="text-gray-600 mb-4">No favorites yet</p>
                  <p className="text-sm text-gray-500">
                    Browse restaurants and add them to your favorites!
                  </p>
                  <Link 
                    href="/"
                    className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Browse Restaurants
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="relative border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all group">
                      <Link href={`/menu/${fav.restaurants.slug}`} className="block">
                        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                          {fav.restaurants.name}
                        </h3>
                        {fav.restaurants.address && (
                          <p className="text-sm text-gray-600 mb-2">📍 {fav.restaurants.address}</p>
                        )}
                        <span className="text-orange-600 text-sm font-semibold">View Menu →</span>
                      </Link>
                      
                      {/* Remove from Favorites Button */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault()
                          if (confirm(`Remove ${fav.restaurants.name} from favorites?`)) {
                            const { error } = await removeFromFavorites(user.id, fav.restaurant_id)
                            if (!error) {
                              // Refresh favorites
                              const { data: userFavorites } = await getUserFavorites(user.id)
                              setFavorites(userFavorites || [])
                            }
                          }
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm mb-1">Favorites</div>
                <div className="text-3xl font-bold text-gray-800">{favorites.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm mb-1">Requests</div>
                <div className="text-3xl font-bold text-gray-800">{requests.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}