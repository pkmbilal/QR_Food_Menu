'use client'

import Link from 'next/link'
import { useCart } from '@/app/CartContext'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CartButton() {
  const { totalItems } = useCart()
  if (!totalItems) return null

  return (
    <>
      {/* MOBILE: full-width sticky bottom bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Button asChild className="w-full h-12 rounded-xl">
            <Link href="/cart" className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">View Cart</span>
              <Badge variant="secondary" className="ml-1">
                {totalItems}
              </Badge>
            </Link>
          </Button>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind the mobile bar */}
      <div className="md:hidden h-[72px]" />

      {/* DESKTOP: floating button bottom-right */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Link href="/cart" aria-label="Open cart" className="relative">
            <ShoppingCart className="h-6 w-6" />

            {/* Badge: slightly different look from the button */}
            <span className="absolute -top-2 -right-2">
              <Badge
                className="
                  h-6 min-w-6 px-2 rounded-full
                  flex items-center justify-center
                  bg-gray-300 text-foreground
                  border shadow-sm
                "
              >
                {totalItems}
              </Badge>
            </span>
          </Link>
        </Button>
      </div>
    </>
  )
}
