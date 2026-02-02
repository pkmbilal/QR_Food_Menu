'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadUser()
  }, [pathname]) // Reload when route changes

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

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    setDropdownOpen(false)
    router.push('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('.dropdown-container')) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/dashboard/admin'
    if (profile?.role === 'owner') return '/dashboard/owner'
    return '/dashboard/customer'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl">🍕</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              QR Menu
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#how-it-works"
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#restaurants"
              className="text-gray-700 hover:text-orange-600 font-semibold transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>

          {/* Desktop - Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user && profile ? (
              // Logged in - Show Avatar with Dropdown
              <div className="relative dropdown-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {getInitials()}
                  </div>
                  {/* Name */}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {profile.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                  </div>
                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">📊</span>
                      <span className="text-sm font-semibold text-gray-700">Dashboard</span>
                    </Link>

                    {profile.role === 'customer' && (
                      <Link
                        href="/dashboard/request-restaurant"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xl">🏪</span>
                        <span className="text-sm font-semibold text-gray-700">Request Owner Access</span>
                      </Link>
                    )}

                    <Link
                      href="/dashboard/customer/edit-profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">⚙️</span>
                      <span className="text-sm font-semibold text-gray-700">Edit Profile</span>
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <span className="text-xl">🚪</span>
                        <span className="text-sm font-semibold text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - Show Login/Signup Button
              <Link
                href="/auth/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-orange-600 font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#restaurants"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-orange-600 font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Browse Restaurants
              </Link>

              {user && profile ? (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-gray-800">{profile.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-xl">📊</span>
                    <span className="font-semibold text-gray-700">Dashboard</span>
                  </Link>
                  {profile.role === 'customer' && (
                    <Link
                      href="/dashboard/request-restaurant"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-xl">🏪</span>
                      <span className="font-semibold text-gray-700">Request Owner Access</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard/customer/edit-profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="font-semibold text-gray-700">Edit Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="font-semibold text-red-600">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors mx-4"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}