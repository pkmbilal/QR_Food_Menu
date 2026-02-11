'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, getUserFavorites, removeFromFavorites } from '@/lib/auth'

import DashboardShell from '@/components/dashboard/customer/DashboardShell'
import CustomerHeader from '@/components/dashboard/customer/CustomerHeader'
import StatsRowMobile from '@/components/dashboard/customer/StatsRowMobile'
import ProfileCard from '@/components/dashboard/customer/ProfileCard'
import FavoritesCard from '@/components/dashboard/customer/FavoritesCard'
import RequestsCard from '@/components/dashboard/customer/RequestsCard'
import RequestOwnerCard from '@/components/dashboard/customer/RequestOwnerCard'
import { useCustomerDashboardData } from '@/components/dashboard/customer/hooks/useCustomerDashboardData'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const {
    user,
    profile,
    favorites,
    setFavorites,
    requests,
    loading,
  } = useCustomerDashboardData()

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim() || 'User'
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }, [profile?.full_name])

  const handleLogout = useCallback(async () => {
    await signOut()
    router.push('/auth/login')
  }, [router])

  const handleRemoveFavorite = useCallback(
    async (restaurantId, restaurantName) => {
      if (!user?.id) return
      if (!confirm(`Remove ${restaurantName} from favorites?`)) return

      const { error } = await removeFromFavorites(user.id, restaurantId)
      if (!error) {
        const { data } = await getUserFavorites(user.id)
        setFavorites(data || [])
      }
    },
    [user?.id, setFavorites]
  )

  return (
    <DashboardShell loading={loading}>
      <CustomerHeader
        initials={initials}
        fullName={profile?.full_name}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <StatsRowMobile favoritesCount={favorites.length} requestsCount={requests.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobile stack */}
          <div className="space-y-6 lg:hidden">
            <ProfileCard user={user} profile={profile} />
            <FavoritesCard favorites={favorites} onRemove={handleRemoveFavorite} />
            <RequestsCard requests={requests} />
            <RequestOwnerCard />
          </div>

          {/* Desktop */}
          <div className="hidden lg:block space-y-6">
            <ProfileCard user={user} profile={profile} />
          </div>

          <div className="hidden lg:block lg:col-span-2 space-y-6">
            <RequestsCard requests={requests} />
            <FavoritesCard favorites={favorites} onRemove={handleRemoveFavorite} />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
