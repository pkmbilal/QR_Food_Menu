'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getUserProfile,
  getUserFavorites,
  getUserRequests,
} from '@/lib/auth'

export function useCustomerDashboardData() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { user: currentUser, error: userError } = await getCurrentUser()

      if (userError || !currentUser) {
        router.push('/auth/login')
        return
      }

      if (!mounted) return
      setUser(currentUser)

      const { data: userProfile } = await getUserProfile(currentUser.id)

      if (!mounted) return
      setProfile(userProfile)

      if (userProfile && userProfile.role !== 'customer') {
        router.push(`/dashboard/${userProfile.role}`)
        return
      }

      const [{ data: userFavorites }, { data: userRequests }] = await Promise.all([
        getUserFavorites(currentUser.id),
        getUserRequests(currentUser.id),
      ])

      if (!mounted) return
      setFavorites(userFavorites || [])
      setRequests(userRequests || [])
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  return {
    user,
    profile,
    favorites,
    setFavorites,
    requests,
    setRequests,
    loading,
  }
}
