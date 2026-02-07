'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Ban, CheckCircle, X } from 'lucide-react'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [pendingRequests, setPendingRequests] = useState([])
  const [allRequests, setAllRequests] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allRestaurants, setAllRestaurants] = useState([])

  // ✅ Cities
  const [cities, setCities] = useState([])
  const [cityName, setCityName] = useState('')
  const [cityLoading, setCityLoading] = useState(false)
  const [cityError, setCityError] = useState('')

  // ✅ Cuisines
  const [cuisines, setCuisines] = useState([])
  const [cuisineName, setCuisineName] = useState('')
  const [cuisineLoading, setCuisineLoading] = useState(false)
  const [cuisineError, setCuisineError] = useState('')

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending') // pending, all, users, restaurants, cities, cuisines
  const router = useRouter()

  useEffect(() => {
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function loadAdminData() {
    setLoading(true)

    const { user: currentUser, error: userError } = await getCurrentUser()
    if (userError || !currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)

    const { data: userProfile } = await getUserProfile(currentUser.id)
    setProfile(userProfile)

    if (userProfile && userProfile.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    await Promise.all([
      loadRequests(),
      loadUsers(),
      loadRestaurants(),
      loadCities(),
      loadCuisines(),
    ])

    setLoading(false)
  }

  async function loadRequests() {
    const { data: requests, error } = await supabase
      .from('restaurant_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading requests:', error)
      setAllRequests([])
      setPendingRequests([])
      return
    }

    if (requests) {
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', request.user_id)
            .single()

          return { ...request, user_profiles: userProfile }
        })
      )

      setAllRequests(requestsWithUsers)
      setPendingRequests(requestsWithUsers.filter((req) => req.status === 'pending'))
    } else {
      setAllRequests([])
      setPendingRequests([])
    }
  }

  async function loadUsers() {
    const { data } = await supabase.from('user_profiles').select('*').order('created_at', {
      ascending: false,
    })
    setAllUsers(data || [])
  }

  async function loadRestaurants() {
    const { data } = await supabase.from('restaurants').select('*').order('created_at', {
      ascending: false,
    })
    setAllRestaurants(data || [])
  }

  async function loadCities() {
    const { data, error } = await supabase.from('cities').select('*').order('name', {
      ascending: true,
    })

    if (error) {
      console.error('Error loading cities:', error)
      setCities([])
      return
    }

    setCities(data || [])
  }

  async function loadCuisines() {
    const { data, error } = await supabase
      .from('cuisines')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading cuisines:', error)
      setCuisines([])
      return
    }

    setCuisines(data || [])
  }

  /* ---------------- Users actions ---------------- */
  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return

    const { error } = await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId)

    if (error) return alert('Error changing role: ' + error.message)

    alert(`✅ User role changed to ${newRole}`)
    loadUsers()
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) return alert('Error updating user status: ' + error.message)

    alert(`✅ User ${action}d successfully`)
    loadUsers()
  }

  const handleDeleteUser = async (userId, userName) => {
    const confirmText = prompt(
      `⚠️ WARNING: This will permanently delete the user and all their data!\n\n` +
        `Type "${userName || 'DELETE'}" to confirm:`
    )

    if (confirmText !== (userName || 'DELETE')) return alert('Deletion cancelled')

    const { error } = await supabase.from('user_profiles').delete().eq('id', userId)
    if (error) return alert('Error deleting user: ' + error.message)

    alert('✅ User deleted successfully')
    loadUsers()
  }

  /* ---------------- Requests actions ---------------- */
  const handleApprove = async (request) => {
    if (!confirm(`Approve ${request.restaurant_name}?`)) return

    try {
      const slug = request.restaurant_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: request.restaurant_name,
            slug,
            phone: request.phone,
            address: request.address,
            owner_id: request.user_id,
            owner_email: request.user_profiles?.email,
            is_active: true,
            approved_at: new Date().toISOString(),
            // city_id: request.city_id,
          },
        ])
        .select()
        .single()

      if (restaurantError) return alert('Error creating restaurant: ' + restaurantError.message)
      if (!restaurant) return alert('Failed to create restaurant')

      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'owner' })
        .eq('id', request.user_id)

      if (roleError) return alert('Error updating user role: ' + roleError.message)

      const { error: requestError } = await supabase
        .from('restaurant_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', request.id)

      if (requestError) return alert('Error updating request: ' + requestError.message)

      alert('✅ Request approved! Restaurant created and user promoted to owner.')
      loadAdminData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleReject = async (request) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    const { error } = await supabase
      .from('restaurant_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason,
      })
      .eq('id', request.id)

    if (error) return alert('Error rejecting request: ' + error.message)

    alert('Request rejected.')
    loadAdminData()
  }

  /* ---------------- Cities actions ---------------- */
  const handleAddCity = async (e) => {
    e.preventDefault()
    setCityError('')

    const clean = cityName.trim()
    if (!clean) return setCityError('City name cannot be empty')

    setCityLoading(true)

    const { error } = await supabase.from('cities').insert([{ name: clean }])

    if (error) {
      const msg = error.message?.toLowerCase().includes('duplicate')
        ? 'City already exists.'
        : error.message
      setCityError(msg)
      setCityLoading(false)
      return
    }

    setCityName('')
    setCityLoading(false)
    loadCities()
  }

  const handleRenameCity = async (cityId, newName) => {
    const clean = newName.trim()
    if (!clean) return { ok: false, message: 'Name cannot be empty' }

    const { error } = await supabase.from('cities').update({ name: clean }).eq('id', cityId)

    if (error) {
      const msg = error.message?.toLowerCase().includes('duplicate')
        ? 'City already exists.'
        : error.message
      return { ok: false, message: msg }
    }

    await loadCities()
    return { ok: true }
  }

  const handleToggleCity = async (city) => {
    const action = city.is_active ? 'disable' : 'enable'
    if (!confirm(`Are you sure you want to ${action} ${city.name}?`)) return

    const { error } = await supabase
      .from('cities')
      .update({ is_active: !city.is_active })
      .eq('id', city.id)

    if (error) return alert('Error updating city: ' + error.message)

    loadCities()
  }

  const handleDeleteCity = async (city) => {
    const confirmText = prompt(`Type "${city.name}" to delete this city:`)
    if (confirmText !== city.name) return

    const { error } = await supabase.from('cities').delete().eq('id', city.id)
    if (error) return alert('Error deleting city: ' + error.message)

    loadCities()
  }

  /* ---------------- Cuisines actions ---------------- */
  const handleAddCuisine = async (e) => {
    e.preventDefault()
    setCuisineError('')

    const clean = cuisineName.trim()
    if (!clean) return setCuisineError('Cuisine name cannot be empty')

    setCuisineLoading(true)

    const { error } = await supabase.from('cuisines').insert([{ name: clean }])

    if (error) {
      const msg = error.message?.toLowerCase().includes('duplicate')
        ? 'Cuisine already exists.'
        : error.message
      setCuisineError(msg)
      setCuisineLoading(false)
      return
    }

    setCuisineName('')
    setCuisineLoading(false)
    loadCuisines()
  }

  const handleRenameCuisine = async (cuisineId, newName) => {
    const clean = newName.trim()
    if (!clean) return { ok: false, message: 'Name cannot be empty' }

    const { error } = await supabase.from('cuisines').update({ name: clean }).eq('id', cuisineId)

    if (error) {
      const msg = error.message?.toLowerCase().includes('duplicate')
        ? 'Cuisine already exists.'
        : error.message
      return { ok: false, message: msg }
    }

    await loadCuisines()
    return { ok: true }
  }

  const handleToggleCuisine = async (cuisine) => {
    const action = cuisine.is_active ? 'disable' : 'enable'
    if (!confirm(`Are you sure you want to ${action} ${cuisine.name}?`)) return

    const { error } = await supabase
      .from('cuisines')
      .update({ is_active: !cuisine.is_active })
      .eq('id', cuisine.id)

    if (error) return alert('Error updating cuisine: ' + error.message)

    loadCuisines()
  }

  const handleDeleteCuisine = async (cuisine) => {
    const confirmText = prompt(`Type "${cuisine.name}" to delete this cuisine:`)
    if (confirmText !== cuisine.name) return

    const { error } = await supabase.from('cuisines').delete().eq('id', cuisine.id)
    if (error) return alert('Error deleting cuisine: ' + error.message)

    loadCuisines()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-gray-100">Welcome, {profile?.full_name || 'Admin'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Cities</div>
            <div className="text-3xl font-bold text-gray-800">{cities.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Cuisines</div>
            <div className="text-3xl font-bold text-gray-800">{cuisines.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 overflow-x-auto">
              {[
                ['pending', `Pending Requests (${pendingRequests.length})`],
                ['all', 'All Requests'],
                ['users', 'Users'],
                ['restaurants', 'Restaurants'],
                ['cities', 'Cities'],
                ['cuisines', 'Cuisines'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === key
                      ? 'border-primary text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Pending Requests */}
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
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-primary transition"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {request.restaurant_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Requested by:{' '}
                              <span className="font-semibold">
                                {request.user_profiles?.full_name || 'Unknown'}
                              </span>{' '}
                              ({request.user_profiles?.email})
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
                                <span className="font-semibold">Description:</span>{' '}
                                {request.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(request)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Requests */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                {allRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{request.restaurant_name}</h3>
                        <p className="text-sm text-gray-600">
                          {request.user_profiles?.email} •{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {request.status === 'rejected' && request.rejection_reason && (
                      <p className="text-xs text-red-600 mt-2">Reason: {request.rejection_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {allUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition"
                  >
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
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            userItem.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : userItem.role === 'owner'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleChangeRole(userItem.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                        disabled={userItem.id === user.id}
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          userItem.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={userItem.id === user.id}
                      >
                        {userItem.is_active ? 'Disable User' : 'Enable User'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(userItem.id, userItem.full_name)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                        disabled={userItem.id === user.id}
                      >
                        Delete User
                      </button>
                    </div>

                    {userItem.id === user.id && (
                      <p className="text-xs text-gray-500 mt-3 italic">
                        You cannot modify your own account
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Restaurants */}
            {activeTab === 'restaurants' && (
              <div className="space-y-4">
                {allRestaurants.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🏪</div>
                    <p className="text-gray-600">No restaurants yet</p>
                  </div>
                ) : (
                  allRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} onUpdate={loadRestaurants} />
                  ))
                )}
              </div>
            )}

            {/* Cities */}
            {activeTab === 'cities' && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Add City</h3>

                  <form onSubmit={handleAddCity} className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="e.g., Riyadh"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    <button
                      type="submit"
                      disabled={cityLoading}
                      className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
                    >
                      {cityLoading ? 'Adding...' : 'Add'}
                    </button>
                  </form>

                  {cityError && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {cityError}
                    </div>
                  )}
                </div>

                {cities.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">No cities yet. Add your first one.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <CityPill
                        key={c.id}
                        city={c}
                        onRename={handleRenameCity}
                        onToggle={handleToggleCity}
                        onDelete={handleDeleteCity}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ✅ Cuisines */}
            {activeTab === 'cuisines' && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Add Cuisine</h3>

                  <form onSubmit={handleAddCuisine} className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={cuisineName}
                      onChange={(e) => setCuisineName(e.target.value)}
                      placeholder="e.g., Arabic, South Indian"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    <button
                      type="submit"
                      disabled={cuisineLoading}
                      className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
                    >
                      {cuisineLoading ? 'Adding...' : 'Add'}
                    </button>
                  </form>

                  {cuisineError && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {cuisineError}
                    </div>
                  )}
                </div>

                {cuisines.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No cuisines yet. Add your first one.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map((c) => (
                      <CuisinePill
                        key={c.id}
                        cuisine={c}
                        onRename={handleRenameCuisine}
                        onToggle={handleToggleCuisine}
                        onDelete={handleDeleteCuisine}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- City Pill ---------------- */
function CityPill({ city, onRename, onToggle, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(city.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setName(city.name), [city.name])

  const save = async () => {
    setError('')
    setSaving(true)

    const res = await onRename(city.id, name)

    setSaving(false)
    if (!res?.ok) {
      setError(res?.message || 'Failed to rename')
      return
    }
    setEditing(false)
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
        city.is_active ? 'bg-gray-100 border-gray-200' : 'bg-red-50 border-red-200'
      }`}
    >
      {!editing ? (
        <>
          <span className={`text-sm font-semibold ${city.is_active ? 'text-gray-800' : 'text-red-700'}`}>
            {city.name}
          </span>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/70 transition cursor-pointer"
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggle(city)}
            className={`p-1 rounded-full transition cursor-pointer ${
              city.is_active
                ? 'text-yellow-700 hover:text-yellow-900 hover:bg-white/70'
                : 'text-green-700 hover:text-green-900 hover:bg-white/70'
            }`}
            title={city.is_active ? 'Disable' : 'Enable'}
          >
            {city.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => onDelete(city)}
            className="p-1 rounded-full text-red-600 hover:text-red-800 hover:bg-white/70 transition cursor-pointer"
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
            <CheckCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setName(city.name)
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

/* ---------------- Cuisine Pill ---------------- */
function CuisinePill({ cuisine, onRename, onToggle, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cuisine.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setName(cuisine.name), [cuisine.name])

  const save = async () => {
    setError('')
    setSaving(true)

    const res = await onRename(cuisine.id, name)

    setSaving(false)
    if (!res?.ok) {
      setError(res?.message || 'Failed to rename')
      return
    }
    setEditing(false)
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
        cuisine.is_active ? 'bg-gray-100 border-gray-200' : 'bg-red-50 border-red-200'
      }`}
    >
      {!editing ? (
        <>
          <span
            className={`text-sm font-semibold ${cuisine.is_active ? 'text-gray-800' : 'text-red-700'}`}
          >
            {cuisine.name}
          </span>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/70 transition cursor-pointer"
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggle(cuisine)}
            className={`p-1 rounded-full transition cursor-pointer ${
              cuisine.is_active
                ? 'text-yellow-700 hover:text-yellow-900 hover:bg-white/70'
                : 'text-green-700 hover:text-green-900 hover:bg-white/70'
            }`}
            title={cuisine.is_active ? 'Disable' : 'Enable'}
          >
            {cuisine.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => onDelete(cuisine)}
            className="p-1 rounded-full text-red-600 hover:text-red-800 hover:bg-white/70 transition cursor-pointer"
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
            <CheckCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setName(cuisine.name)
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

/* ---------------- Restaurant Card ---------------- */
function RestaurantCard({ restaurant, onUpdate }) {
  const [menuItemCount, setMenuItemCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMenuItemCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id])

  async function loadMenuItemCount() {
    const { count } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)

    setMenuItemCount(count || 0)
  }

  const handleToggleStatus = async () => {
    const action = restaurant.is_active ? 'disable' : 'enable'
    if (!confirm(`Are you sure you want to ${action} ${restaurant.name}?`)) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !restaurant.is_active })
        .eq('id', restaurant.id)
        .select()

      if (error) {
        alert('Error updating restaurant: ' + error.message)
        return
      }

      alert(`✅ Restaurant ${action}d successfully`)
      await onUpdate()
    } catch (err) {
      alert('Error updating restaurant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmText = prompt(
      `⚠️ WARNING: This will permanently delete "${restaurant.name}" and all its menu items!\n\n` +
        `Type "${restaurant.name}" to confirm:`
    )

    if (confirmText !== restaurant.name) {
      alert('Deletion cancelled')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('restaurants').delete().eq('id', restaurant.id)

    if (error) {
      alert('Error deleting restaurant: ' + error.message)
    } else {
      alert('✅ Restaurant deleted successfully')
      onUpdate()
    }
    setLoading(false)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-gray-800 text-xl">{restaurant.name}</h3>
            {!restaurant.is_active ? (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                DISABLED
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                ACTIVE
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold">URL:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/menu/{restaurant.slug}</code>
              <Link
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className="text-orange-600 hover:text-orange-700 text-xs"
              >
                View →
              </Link>
            </p>

            {restaurant.owner_email && (
              <p className="flex items-center gap-2">
                <span className="font-semibold">Owner:</span>
                <span>{restaurant.owner_email}</span>
              </p>
            )}

            {restaurant.phone && (
              <p className="flex items-center gap-2">
                <span className="font-semibold">Phone:</span>
                <span>{restaurant.phone}</span>
              </p>
            )}

            {restaurant.address && (
              <p className="flex items-center gap-2">
                <span className="font-semibold">Address:</span>
                <span>{restaurant.address}</span>
              </p>
            )}

            <p className="flex items-center gap-2">
              <span className="font-semibold">Menu Items:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                {menuItemCount}
              </span>
            </p>

            <p className="flex items-center gap-2 text-xs">
              <span className="font-semibold">Created:</span>
              <span>{new Date(restaurant.created_at).toLocaleDateString()}</span>
            </p>

            {restaurant.approved_at && (
              <p className="flex items-center gap-2 text-xs">
                <span className="font-semibold">Approved:</span>
                <span>{new Date(restaurant.approved_at).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
        <Link
          href={`/menu/${restaurant.slug}`}
          target="_blank"
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors"
        >
          View Menu
        </Link>

        <Link
          href={`/qr/${restaurant.slug}`}
          target="_blank"
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors"
        >
          QR Code
        </Link>

        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            restaurant.is_active
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:opacity-50`}
        >
          {restaurant.is_active ? 'Disable Restaurant' : 'Enable Restaurant'}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          Delete Restaurant
        </button>
      </div>
    </div>
  )
}
