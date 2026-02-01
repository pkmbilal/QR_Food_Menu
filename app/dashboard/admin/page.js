'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [allRequests, setAllRequests] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allRestaurants, setAllRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending') // pending, all, users, restaurants
  const router = useRouter()

  useEffect(() => {
    loadAdminData()
  }, [router])

  async function loadAdminData() {
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

    // Check if user is actually admin
    if (userProfile && userProfile.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    // Load all data
    await Promise.all([
      loadRequests(),
      loadUsers(),
      loadRestaurants()
    ])

    setLoading(false)
  }

async function loadRequests() {
  // Get all requests first
  const { data: requests, error } = await supabase
    .from('restaurant_requests')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('=== REQUESTS DEBUG ===')
  console.log('Error:', error)
  console.log('Requests:', requests)

  if (error) {
    console.error('Error loading requests:', error)
    setAllRequests([])
    setPendingRequests([])
    return
  }

  // Manually get user info for each request
  if (requests) {
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', request.user_id)
          .single()
        
        return {
          ...request,
          user_profiles: userProfile
        }
      })
    )

    console.log('Requests with user data:', requestsWithUsers)
    console.log('Pending count:', requestsWithUsers.filter(req => req.status === 'pending').length)

    setAllRequests(requestsWithUsers)
    setPendingRequests(requestsWithUsers.filter(req => req.status === 'pending'))
  } else {
    setAllRequests([])
    setPendingRequests([])
  }
}

  async function loadUsers() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setAllUsers(data || [])
  }

  async function loadRestaurants() {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    setAllRestaurants(data || [])
  }

  const handleChangeRole = async (userId, newRole) => {
  if (!confirm(`Change user role to ${newRole}?`)) return

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert('Error changing role: ' + error.message)
      return
    }

    alert(`✅ User role changed to ${newRole}`)
    loadUsers() // Reload users list

  } catch (err) {
    alert('Error: ' + err.message)
  }
}

const handleToggleUserStatus = async (userId, currentStatus) => {
  const action = currentStatus ? 'disable' : 'enable'
  if (!confirm(`Are you sure you want to ${action} this user?`)) return

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) {
      alert('Error updating user status: ' + error.message)
      return
    }

    alert(`✅ User ${action}d successfully`)
    loadUsers() // Reload users list

  } catch (err) {
    alert('Error: ' + err.message)
  }
}

const handleDeleteUser = async (userId, userName) => {
  const confirmText = prompt(
    `⚠️ WARNING: This will permanently delete the user and all their data!\n\n` +
    `Type "${userName || 'DELETE'}" to confirm:`
  )

  if (confirmText !== (userName || 'DELETE')) {
    alert('Deletion cancelled')
    return
  }

  try {
    // Delete user profile (will cascade delete related data)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      alert('Error deleting user: ' + error.message)
      return
    }

    alert('✅ User deleted successfully')
    loadUsers() // Reload users list

  } catch (err) {
    alert('Error: ' + err.message)
  }
}

  const handleApprove = async (request) => {
    if (!confirm(`Approve ${request.restaurant_name}?`)) return

    try {
      // Generate slug from restaurant name
      const slug = request.restaurant_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Step 1: Create the restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          name: request.restaurant_name,
          slug: slug,
          phone: request.phone,
          address: request.address,
          owner_id: request.user_id,
          owner_email: request.user_profiles?.email,
          is_active: true,
          approved_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (restaurantError) {
        alert('Error creating restaurant: ' + restaurantError.message)
        return
      }

      // Step 2: Update user role to owner
      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'owner' })
        .eq('id', request.user_id)

      if (roleError) {
        alert('Error updating user role: ' + roleError.message)
        return
      }

      // Step 3: Update request status
      const { error: requestError } = await supabase
        .from('restaurant_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', request.id)

      if (requestError) {
        alert('Error updating request: ' + requestError.message)
        return
      }

      // Success! Reload data
      alert('✅ Request approved! Restaurant created and user promoted to owner.')
      loadAdminData()

    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleReject = async (request) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const { error } = await supabase
        .from('restaurant_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: reason
        })
        .eq('id', request.id)

      if (error) {
        alert('Error rejecting request: ' + error.message)
        return
      }

      alert('Request rejected.')
      loadAdminData()

    } catch (err) {
      alert('Error: ' + err.message)
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">👑</span>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-purple-100">Welcome, {profile?.full_name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Users</div>
            <div className="text-3xl font-bold text-blue-600">{allUsers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Restaurants</div>
            <div className="text-3xl font-bold text-green-600">{allRestaurants.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Requests</div>
            <div className="text-3xl font-bold text-purple-600">{allRequests.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'pending'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'restaurants'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Restaurants
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
              <div>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-gray-600">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {request.restaurant_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Requested by: <span className="font-semibold">{request.user_profiles?.full_name || 'Unknown'}</span> ({request.user_profiles?.email})
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-semibold ml-2">{request.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Submitted:</span>
                                <span className="font-semibold ml-2">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {request.address && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-semibold">Address:</span> {request.address}
                              </p>
                            )}
                            {request.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-semibold">Description:</span> {request.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(request)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Requests Tab */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                {allRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{request.restaurant_name}</h3>
                        <p className="text-sm text-gray-600">
                          {request.user_profiles?.email} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    {request.status === 'rejected' && request.rejection_reason && (
                      <p className="text-xs text-red-600 mt-2">
                        Reason: {request.rejection_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {allUsers.map((userItem) => (
                  <div key={userItem.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">
                            {userItem.full_name || 'No name'}
                          </h3>
                          {!userItem.is_active && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                              DISABLED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">ID: {userItem.id}</p>
                        {userItem.phone && (
                          <p className="text-sm text-gray-600">Phone: {userItem.phone}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(userItem.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        {/* Role Badge */}
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          userItem.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userItem.role}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Change Role Dropdown */}
                      <select
                        value={userItem.role}
                        onChange={(e) => handleChangeRole(userItem.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                        disabled={userItem.id === user.id} // Can't change own role
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Disable/Enable Button */}
                      <button
                        onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          userItem.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={userItem.id === user.id} // Can't disable yourself
                      >
                        {userItem.is_active ? 'Disable User' : 'Enable User'}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteUser(userItem.id, userItem.full_name)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                        disabled={userItem.id === user.id} // Can't delete yourself
                      >
                        Delete User
                      </button>
                    </div>

                    {/* Warning for own account */}
                    {userItem.id === user.id && (
                      <p className="text-xs text-gray-500 mt-3 italic">
                        You cannot modify your own account
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <div className="space-y-3">
                {allRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600">/{restaurant.slug}</p>
                        {restaurant.address && (
                          <p className="text-xs text-gray-500 mt-1">📍 {restaurant.address}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {restaurant.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}