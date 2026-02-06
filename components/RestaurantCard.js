import Link from "next/link"
import FavoriteButtonClient from "@/components/FavoriteButtonClient"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Pin } from "lucide-react"

export default function RestaurantCard({ restaurant }) {
  const {
    id,
    slug,
    name,
    address,
    city,
    image_url,
    logo_url,
  } = restaurant

  return (
    <div className="relative">
      {/* ✅ Client Component inside Server Component is allowed */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButtonClient restaurantId={id} />
      </div>

      <Card className="overflow-hidden transition-all hover:shadow-xl py-0 gap-2">
        {/* 1) Restaurant image */}
        
            
            <div className="relative h-48 w-full bg-gradient-to-br from-orange-400 to-red-500">
                {image_url ? (
                <img
                    src={image_url}
                    alt={`${name} cover`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                ) : (
                <div className="h-full w-full flex items-center justify-center">
                    <span className="text-7xl"><UtensilsCrossed size={64} /></span>
                </div>
                )}
            </div>
            
        

        {/* 2) logo + 3) name */}
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {logo_url ? (
              <div className="h-12 w-12 rounded-xl overflow-hidden border bg-white">
                <img
                  src={logo_url}
                  alt={`${name} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="min-w-0">
                <h3 className="text-xl font-bold leading-tight truncate">
                    {name}
                </h3>
            </div>
          </div>
        </CardHeader>

        {/* 4) address + 5) city */}
        <CardContent className="space-y-2">
          {address ? (
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="mt-0.5"><Pin size={16} color="#00c951" /></span>
              <span className="line-clamp-2">{address}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="mt-0.5"><Pin size={16} color="#00c951" /></span>
              <span>No address provided</span>
            </p>
          )}

          {city ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>🏙️</span>
              <span className="truncate">{city}</span>
            </p>
          ) : null}
        </CardContent>

        {/* 6) View Menu */}
        <CardFooter className="flex items-center justify-between !pt-3 !pb-6">
          <Button asChild variant="ghost" className="gap-2 w-full bg-primary hover:bg-green-600 text-white hover:text-white">
            <Link href={`/menu/${slug}`}>
              View Menu <span aria-hidden>→</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
