'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useCart } from '@/app/CartContext'

import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  BadgeCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function CartPage() {
  const { cartItems, restaurant, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart()

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  // WhatsApp wants digits only (country code included). e.g. 9665xxxxxxx
  const restaurantPhone = useMemo(() => {
    const raw = restaurant?.phone ?? ''
    const digits = String(raw).replace(/\D/g, '')
    return digits || '' // if empty, we’ll disable the WhatsApp button
  }, [restaurant?.phone])

  const money = (v) => `SAR ${Number(v || 0).toFixed(2)}`

  const generateWhatsAppMessage = () => {
    let message = `🛒 *New Order*\n\n`

    if (restaurant?.name) {
      message += `🏪 *Restaurant:* ${restaurant.name}\n`
    }
    if (restaurant?.slug) {
      message += `🔗 *Menu:* /menu/${restaurant.slug}\n`
    }

    message += `\n*Items*\n`
    cartItems.forEach((item) => {
      message += `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}\n`
    })

    message += `\n*Total:* ${money(totalPrice)}`
    return encodeURIComponent(message)
  }

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDec = (item) => {
    if (item.quantity <= 1) return removeFromCart(item.id)
    updateQuantity(item.id, item.quantity - 1)
  }

  const handleInc = (item) => updateQuantity(item.id, item.quantity + 1)

  // EMPTY STATE
  if (!cartItems?.length) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your cart is empty
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add some items and come back — we’ll keep them here 🍔
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/">Browse restaurants</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/restaurants">Search food</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="shrink-0">
                <Link href={restaurant?.slug ? `/menu/${restaurant.slug}` : '/'}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>

              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold leading-tight truncate">
                  Your Cart
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {totalItems} item{totalItems === 1 ? '' : 's'}
                  </Badge>

                  {restaurant?.name && (
                    <Badge variant="outline" className="gap-1">
                      <Store className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[220px]">{restaurant.name}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            className="shrink-0"
            onClick={clearCart}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Layout: items + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Items */}
          <Card className="lg:col-span-8 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Items</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-5 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                      {item.image_url ? (
                        // keep <img> to avoid next/image domain config headaches
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Middle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {money(item.price)} each
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        {/* Qty controls */}
                        <div className="inline-flex items-center rounded-full border bg-background p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleDec(item)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <div className="w-10 text-center font-semibold">
                            {item.quantity}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleInc(item)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Line total */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Item total</p>
                          <p className="font-bold">{money(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={restaurant?.slug ? `/menu/${restaurant.slug}` : '/'}>
                  Continue shopping
                </Link>
              </Button>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Review your items before ordering
              </div>
            </CardFooter>
          </Card>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Card className="lg:sticky lg:top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{money(totalPrice)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">{money(totalPrice)}</span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleWhatsAppOrder}
                  disabled={!restaurantPhone}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Order via WhatsApp
                </Button>

                {!restaurantPhone && (
                  <p className="text-xs text-muted-foreground">
                    WhatsApp ordering is unavailable because the restaurant phone number isn’t set.
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Tip: Make sure the phone number includes country code (e.g. Saudi Arabia: 966…).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
