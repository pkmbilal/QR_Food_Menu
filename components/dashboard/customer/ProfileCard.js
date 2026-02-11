'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, Settings, User2 } from 'lucide-react'

export default function ProfileCard({ user, profile }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User2 className="h-5 w-5 text-primary" />
          Your Profile
        </CardTitle>

        <div className="flex items-center justify-start gap-3">
          <p className="text-xs text-muted-foreground">Role</p>
          <Badge variant="secondary" className="bg-primary text-white">
            {profile?.role || 'customer'}
          </Badge>
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
              <p className="font-semibold truncate">{user?.email || '—'}</p>
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
  )
}
