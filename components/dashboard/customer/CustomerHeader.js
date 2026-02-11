'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Settings, LogOut } from 'lucide-react'

export default function CustomerHeader({ initials, fullName, onLogout }) {
  return (
    <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">
              {fullName || 'User'} 👋
            </h1>
            <p className="text-sm text-muted-foreground">Customer Dashboard</p>
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/customer/edit-profile">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>

          <Button variant="outline" size="icon" onClick={onLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
