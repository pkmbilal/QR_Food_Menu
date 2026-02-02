'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, addToFavorites, removeFromFavorites, isFavorited } from '@/lib/auth'

export default function FavoriteButton({ restaurantId }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkIfFavorited()
  }, [restaurantId])

  async function checkIfFavorited() {
    setChecking(true)
    
    try {
      // Get current user
      const { user: currentUser } = await getCurrentUser()
      
      if (!currentUser) {
        setUser(null)
        setIsFavorite(false)
        setChecking(false)
        return
      }

      setUser(currentUser)

      // Check if this restaurant is favorited
      const { isFavorited: favorited } = await isFavorited(currentUser.id, restaurantId)
      console.log('Favorite check:', { restaurantId, favorited })
      setIsFavorite(favorited)
      
    } catch (err) {
      console.error('Check favorite error:', err)
      setIsFavorite(false)
    } finally {
      setChecking(false)
    }
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // If not logged in, redirect to login
    if (!user) {
      if (confirm('Please login to save favorites. Go to login page?')) {
        router.push('/auth/login')
      }
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        console.log('Removing favorite:', { userId: user.id, restaurantId })
        const { error } = await removeFromFavorites(user.id, restaurantId)
        
        if (error) {
          console.error('Remove error:', error)
          alert('Error removing favorite: ' + error.message)
        } else {
          console.log('Removed successfully')
          setIsFavorite(false)
        }
      } else {
        // Add to favorites
        console.log('Adding favorite:', { userId: user.id, restaurantId })
        const { data, error } = await addToFavorites(user.id, restaurantId)
        
        if (error) {
          // Check if it's a duplicate key error (already exists)
          if (error.code === '23505') {
            console.log('Already in favorites, just update UI')
            setIsFavorite(true)
          } else {
            console.error('Add error:', error)
            alert('Error adding favorite: ' + error.message)
          }
        } else {
          console.log('Added successfully:', data)
          setIsFavorite(true)
        }
      }
    } catch (err) {
      console.error('Toggle favorite error:', err)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button while checking
  if (checking) {
    return (
      <div className="p-2 rounded-full bg-gray-100 animate-pulse">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        isFavorite
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-6 h-6 transition-all"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}