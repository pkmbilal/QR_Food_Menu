'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl">
        <CardContent className="p-8 text-center space-y-6">

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Lock className="h-8 w-8 text-green-600" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account
            </p>
          </div>

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-xl"
                />

              {error && (
                <p className="text-sm text-destructive text-left">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-green-600 text-white"
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">
                Password updated successfully 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login…
              </p>
            </div>
          )}

          {/* Back to login */}
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-orange-600 transition"
            >
              ← Back to Login
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
