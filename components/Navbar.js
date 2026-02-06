'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { Menu, LayoutDashboard, UserRoundPen, LogOut, ShieldUser, Pizza, Search } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')


  const router = useRouter()
  const pathname = usePathname()

  // ✅ compute this early, but DON'T return yet (hooks must run first)
  const hideNavbar = pathname?.startsWith('/auth/')

  useEffect(() => {
    // ✅ if navbar is hidden, don't do auth/profile loading
    if (hideNavbar) return

    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideNavbar, pathname])

  async function loadUser() {
    const { user: currentUser } = await getCurrentUser()

    if (currentUser) {
      setUser(currentUser)
      const { data: userProfile } = await getUserProfile(currentUser.id)
      setProfile(userProfile)
    } else {
      setUser(null)
      setProfile(null)
    }
  }

    const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (!search.trim()) return
      router.push(`/?q=${encodeURIComponent(search)}`)
      }
    }


  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/dashboard/admin'
    if (profile?.role === 'owner') return '/dashboard/owner'
    return '/dashboard/customer'
  }

  // ✅ safe to return AFTER hooks
  if (hideNavbar) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-3xl"><Pizza size={36} color="#00c951" strokeWidth={2.5} /></span>
          <span className="text-2xl font-bold text-primary">
            ScanEat
          </span>
        </Link>

        {/* Desktop Nav (shadcn NavigationMenu) */}
        <div className="hidden md:flex justify-between items-center gap-6">
          <div className="flex items-center gap-6">
          <p><Link href="/#how-it-works" className='text-md font-semibold hover:text-primary transition-colors'>How It Works</Link></p>
          <p><Link href="/restaurants" className='text-md font-semibold hover:text-primary transition-colors'>Restaurants</Link></p>
          </div>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">{profile.full_name || 'User'}</span>
                    <Badge variant="secondary" className="text-white text-xs h-4 px-1 bg-primary pb-1">
                      {profile.role}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer">
                    <span className="mr-1">
                      <LayoutDashboard color="#00c951" size={20} />
                    </span>
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                {profile.role === 'customer' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/request-restaurant" className="cursor-pointer">
                      <span className="mr-1">
                        <ShieldUser color="#00c951" size={20} />
                      </span>
                      Request Owner Access
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/customer/edit-profile" className="cursor-pointer">
                    <span className="mr-1">
                      <UserRoundPen color="#00c951" size={20} />
                    </span>
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <span className="mr-2">
                    <LogOut color="#00c951" size={20} />
                  </span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Login / Sign Up</Link>
            </Button>
          )}
        </div>

        {/* Mobile (shadcn Sheet) */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[320px] sm:w-[380px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">🍕</span>
                  <span className="font-bold">QR Menu</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-2">
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  How It Works
                </Link>

                <Link
                  href="/#restaurants"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Browse Restaurants
                </Link>

                <Separator className="my-4" />

                {user && profile ? (
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>

                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {profile.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      📊 Dashboard
                    </Link>

                    {profile.role === 'customer' && (
                      <Link
                        href="/dashboard/request-restaurant"
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        🏪 Request Owner Access
                      </Link>
                    )}

                    <Link
                      href="/dashboard/customer/edit-profile"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      ⚙️ Edit Profile
                    </Link>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setMobileOpen(false)
                        handleLogout()
                      }}
                    >
                      🚪 Logout
                    </Button>
                  </div>
                ) : (
                    
                  <Button asChild className="w-full bg-primary hover:bg-green-700">
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      Login / Sign Up
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
