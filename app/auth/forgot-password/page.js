'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  // Hide navbar on this page
  useEffect(() => {
    document.body.classList.add('hide-navbar')
    return () => document.body.classList.remove('hide-navbar')
  }, [])

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset link sent to your email.')
    }

    setLoading(false)
  }

  return (
    <>
      {/* MOBILE wrapper */}
      <div className="md:hidden flex min-h-screen items-center justify-center bg-white px-0">
        <div className="w-full min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md rounded-3xl shadow-none border-0">
            <CardContent className="p-8 text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Forgot your password?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we’ll send you a password reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl"
                />

                {error && (
                  <p className="text-sm text-destructive text-left">{error}</p>
                )}

                {message && (
                  <p className="text-sm text-green-600 text-left">{message}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-green-600 text-white"
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </Button>
              </form>

              {/* Back to login */}
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  ← Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DESKTOP wrapper (green gradient bg) */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we’ll send you a password reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
              />

              {error && (
                <p className="text-sm text-destructive text-left">{error}</p>
              )}

              {message && (
                <p className="text-sm text-green-600 text-left">{message}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-green-600 text-white"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </form>

            {/* Back to login */}
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                ← Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
