'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Heart, ClipboardList } from 'lucide-react'

export default function StatsRowMobile({ favoritesCount = 0, requestsCount = 0 }) {
  return (
    <div className="grid grid-cols-2 lg:hidden gap-3 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Favorites</p>
            <p className="text-2xl font-bold">{favoritesCount}</p>
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
            <p className="text-2xl font-bold">{requestsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
