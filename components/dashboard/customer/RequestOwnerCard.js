'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'

export default function RequestOwnerCard() {
  return (
    <Card>
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
  )
}
