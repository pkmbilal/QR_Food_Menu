'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile } from '@/lib/auth'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUserAndRedirect() {
      // Get current user
      const { user, error: userError } = await getCurrentUser()

      if (userError || !user) {
        // Not logged in - redirect to login
        router.push('/auth/login')
        return
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await getUserProfile(user.id)

      if (profileError || !profile) {
        // Profile not found - something wrong
        router.push('/auth/login')
        return
      }

      // Redirect based on role
      switch (profile.role) {
        case 'admin':
          router.push('/dashboard/admin')
          break
        case 'owner':
          router.push('/dashboard/owner')
          break
        case 'customer':
        default:
          router.push('/dashboard/customer')
          break
      }
    }

    checkUserAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}