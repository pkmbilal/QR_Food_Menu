'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ExternalLink, X } from 'lucide-react'

export default function FavoritesCard({ favorites, onRemove }) {
  return (
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
                    onClick={(e) => {
                      e.preventDefault()
                      onRemove?.(fav.restaurant_id, r.name)
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
  )
}
