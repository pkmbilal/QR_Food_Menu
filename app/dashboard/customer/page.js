'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  getCurrentUser,
  getUserProfile,
  signOut,
  getUserFavorites,
  getUserRequests,
  removeFromFavorites,
} from '@/lib/auth'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// Optional (nice for long lists). If you don’t have it, remove ScrollArea usage.
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  Heart,
  LogOut,
  Settings,
  Store,
  User2,
  Phone,
  Mail,
  ClipboardList,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function CustomerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserData() {
      const { user: currentUser, error: userError } = await getCurrentUser()

      if (userError || !currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const { data: userProfile } = await getUserProfile(currentUser.id)
      setProfile(userProfile)

      if (userProfile && userProfile.role !== 'customer') {
        router.push(`/dashboard/${userProfile.role}`)
        return
      }

      const { data: userFavorites } = await getUserFavorites(currentUser.id)
      setFavorites(userFavorites || [])

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

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim() || 'User'
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }, [profile?.full_name])

  const statusBadge = (status) => {
    if (status === 'pending')
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </Badge>
      )
    if (status === 'approved')
      return (
        <Badge className="gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </Badge>
      )
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="py-10 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                {profile?.full_name || 'User'} 👋
              </h1>
              <p className="text-sm text-muted-foreground">Customer Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard/customer/edit-profile">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>

            <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-2">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Quick action</p>
                <p className="font-semibold truncate">Own a Restaurant?</p>
                <p className="text-sm text-muted-foreground truncate">
                  Create your digital menu and manage orders easily.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/dashboard/request-restaurant">
                  <Store className="h-4 w-4 mr-2" />
                  Request Owner
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User2 className="h-5 w-5 text-primary" />
                  Your Profile
                </CardTitle>
                <div className="flex items-center justify-start gap-3">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge variant="secondary" className="bg-primary text-white">{profile?.role}</Badge>
                  </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <User2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-semibold truncate">{profile?.full_name || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold truncate">{profile?.phone || 'Not set'}</p>
                    </div>
                  </div>

                  
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/dashboard/customer/edit-profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requests */}
            {requests.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Your Restaurant Requests
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Scroll only if many items */}
                  <ScrollArea className={requests.length > 4 ? 'h-[320px] pr-3' : ''}>
                    <div className="space-y-3">
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-xl border bg-background p-4 hover:shadow-sm transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{request.restaurant_name}</p>
                              <p className="text-sm text-muted-foreground">{request.phone}</p>
                            </div>
                            {statusBadge(request.status)}
                          </div>

                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                          )}

                          <p className="text-xs text-muted-foreground mt-3">
                            Submitted: {new Date(request.created_at).toLocaleDateString()}
                          </p>

                          {request.status === 'rejected' && request.rejection_reason && (
                            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                              <span className="font-semibold">Reason: </span>
                              {request.rejection_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Favorites */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Favorite Restaurants
                </CardTitle>
              </CardHeader>

              <CardContent>
                {favorites.length === 0 ? (
                  <div className="rounded-xl border bg-background p-6 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Heart className="h-6 w-6" />
                    </div>
                    <p className="font-semibold">No favorites yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Browse restaurants and save your top picks.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Browse Restaurants
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((fav) => {
                      const r = fav.restaurants
                      if (!r) return null

                      return (
                        <div
                          key={fav.id}
                          className="group rounded-xl border bg-background p-4 hover:shadow-sm transition relative"
                        >
                          <Link href={`/menu/${r.slug}`} className="block">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold truncate group-hover:text-primary transition-colors">
                                  {r.name}
                                </p>
                                {r.address && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    📍 {r.address}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                              View Menu <ExternalLink className="h-4 w-4 ml-1" />
                            </div>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                            title="Remove from favorites"
                            onClick={async (e) => {
                              e.preventDefault()
                              if (confirm(`Remove ${r.name} from favorites?`)) {
                                const { error } = await removeFromFavorites(user.id, fav.restaurant_id)
                                if (!error) {
                                  const { data: userFavorites } = await getUserFavorites(user.id)
                                  setFavorites(userFavorites || [])
                                }
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
