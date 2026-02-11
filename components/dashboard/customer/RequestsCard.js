'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area' // remove if you don't have it
import { ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react'

function StatusBadge({ status }) {
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    )
  }

  if (status === 'approved') {
    return (
      <Badge className="gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3.5 w-3.5" />
      Rejected
    </Badge>
  )
}

export default function RequestsCard({ requests }) {
  if (!requests || requests.length === 0) return null

  const scrollClass = requests.length > 4 ? 'h-[320px] pr-3' : ''

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Your Restaurant Requests
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* If you don't have ScrollArea, replace with:
            <div className={requests.length > 4 ? 'max-h-[320px] overflow-auto pr-3' : ''}>
        */}
        <ScrollArea className={scrollClass}>
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
                  <StatusBadge status={request.status} />
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
  )
}
