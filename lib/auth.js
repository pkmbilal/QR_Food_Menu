import { supabase } from './supabase'

// Sign up new user (simple - just email & password)
export async function signUp(email, password, fullName = '') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  
  // Update profile with full name if provided
  if (data.user && fullName) {
    await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', data.user.id)
  }
  
  return { data, error }
}

// Sign in
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { data, error }
  }

  // Check if user is active
  if (data.user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .single()

    if (profile && !profile.is_active) {
      // Sign out immediately
      await supabase.auth.signOut()
      return { 
        data: null, 
        error: { message: 'Your account has been disabled. Please contact support.' } 
      }
    }
  }
  
  return { data, error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Get user profile with role
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Get user's restaurant (for owners)
export async function getUserRestaurant(userId) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', userId)
    .single()
  
  return { data, error }
}

// Submit restaurant request
export async function submitRestaurantRequest(userId, restaurantData) {
  const { data, error } = await supabase
    .from('restaurant_requests')
    .insert([{
      user_id: userId,
      restaurant_name: restaurantData.name,
      phone: restaurantData.phone,
      address: restaurantData.address,
      description: restaurantData.description
    }])
    .select()
    .single()
  
  return { data, error }
}

// Get user's restaurant requests
export async function getUserRequests(userId) {
  const { data, error } = await supabase
    .from('restaurant_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Add restaurant to favorites
export async function addToFavorites(userId, restaurantId) {
  const { data, error } = await supabase
    .from('favorite_restaurants')
    .insert([{ user_id: userId, restaurant_id: restaurantId }])
    .select()
    .single()
  
  return { data, error }
}

// Remove from favorites
export async function removeFromFavorites(userId, restaurantId) {
  const { error } = await supabase
    .from('favorite_restaurants')
    .delete()
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
  
  return { error }
}

// Get user's favorite restaurants
export async function getUserFavorites(userId) {
  const { data, error } = await supabase
    .from('favorite_restaurants')
    .select(`
      *,
      restaurants (*)
    `)
    .eq('user_id', userId)
  
  return { data, error }
}

// Check if restaurant is favorited
export async function isFavorited(userId, restaurantId) {
  const { data, error } = await supabase
    .from('favorite_restaurants')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single()
  
  return { isFavorited: !!data, error }
}

// Admin: Update user role
export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Admin: Disable/Enable user
export async function toggleUserStatus(userId, isActive) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Admin: Delete user (also deletes from auth.users via CASCADE)
export async function deleteUser(userId) {
  // First delete from user_profiles (this will cascade)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId)
  
  if (profileError) {
    return { error: profileError }
  }

  // Then delete from auth.users (requires admin privileges)
  // Note: This needs to be done via Supabase admin API
  const { data, error } = await supabase.auth.admin.deleteUser(userId)
  
  return { data, error }
}