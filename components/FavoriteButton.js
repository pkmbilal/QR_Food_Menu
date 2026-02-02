'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, addToFavorites, removeFromFavorites, isFavorited } from '@/lib/auth'

export default function FavoriteButton({ restaurantId }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkIfFavorited()
  }, [restaurantId])

  async function checkIfFavorited() {
    // Get current user
    const { user: currentUser } = await getCurrentUser()
    
    if (!currentUser) {
      setUser(null)
      return
    }

    setUser(currentUser)

    // Check if this restaurant is favorited
    const { isFavorited: favorited } = await isFavorited(currentUser.id, restaurantId)
    setIsFavorite(favorited)
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault() // Prevent link navigation if inside a Link
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
        const { error } = await removeFromFavorites(user.id, restaurantId)
        if (error) {
          alert('Error removing favorite: ' + error.message)
        } else {
          setIsFavorite(false)
        }
      } else {
        // Add to favorites
        const { error } = await addToFavorites(user.id, restaurantId)
        if (error) {
          alert('Error adding favorite: ' + error.message)
        } else {
          setIsFavorite(true)
        }
      }
    } catch (err) {
      console.error('Favorite error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all transform hover:scale-110 ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isFavorite
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}