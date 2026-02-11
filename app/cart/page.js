"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/CartContext";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  BadgeCheck,
  Clipboard,
  MapPin,
  Bike,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const {
    cartItems,
    restaurant,
    updateQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
  } = useCart();

  const [tableCode, setTableCode] = useState(null);
  const [tableNumber, setTableNumber] = useState(null); // ✅ NEW: resolved table number
  const [channel, setChannel] = useState("pickup"); // dine_in | pickup | delivery
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");

  const router = useRouter();

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const money = (v) => `SAR ${Number(v || 0).toFixed(2)}`;

  // ✅ Step 1: Read `t` from Cart URL immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("t");
    if (t) setTableCode(t);
  }, []);

  // ✅ Step 2: Prefer `t` from URL, else localStorage fallback, persist back
  useEffect(() => {
    if (!restaurant?.slug) return;
    if (typeof window === "undefined") return;

    const key = `tableCode:${restaurant.slug}`;
    const sp = new URLSearchParams(window.location.search);

    const tFromUrl = sp.get("t");
    const stored = localStorage.getItem(key);
    const code = tFromUrl || tableCode || stored || null;

    if (code) localStorage.setItem(key, code);
    setTableCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.slug]);

  // ✅ Decide channel based on tableCode + restaurant capabilities
  useEffect(() => {
    if (!restaurant) return;

    if (tableCode) {
      setChannel("dine_in");
      return;
    }

    if (restaurant?.pickup_available) setChannel("pickup");
    else if (restaurant?.delivery_available) setChannel("delivery");
    else setChannel("pickup");
  }, [tableCode, restaurant]);

  const isDineIn = !!tableCode;

  // ✅ NEW: resolve table number from server (tableCode -> table_number)
  useEffect(() => {
    if (!isDineIn || !tableCode || !restaurant?.id) {
      setTableNumber(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/table/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            tableCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) return;
        if (!cancelled) setTableNumber(data?.tableNumber ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDineIn, tableCode, restaurant?.id]);

  const menuHref = useMemo(() => {
    if (!restaurant?.slug) return "/";
    return isDineIn
      ? `/menu/${restaurant.slug}?t=${encodeURIComponent(tableCode)}`
      : `/menu/${restaurant.slug}`;
  }, [restaurant?.slug, isDineIn, tableCode]);

  const restaurantPhone = useMemo(() => {
    const raw = restaurant?.phone ?? "";
    const digits = String(raw).replace(/\D/g, "");
    return digits || "";
  }, [restaurant?.phone]);

  const generateWhatsAppMessage = () => {
    let message = `*NEW ORDER*\n`;
    message += `━━━━━━━━━━━━━━\n`;

    // Restaurant + type
    if (restaurant?.name) message += `*Restaurant:* ${restaurant.name}\n`;

    const typeLabel = isDineIn
      ? "Dine-in"
      : channel === "delivery"
        ? "Delivery"
        : "Pickup";

    message += `*Type:* ${typeLabel}\n`;

    // Table (dine-in)
    if (isDineIn) {
      message += `*Table:* ${tableNumber ? `Table ${tableNumber}` : "Table ?"}\n`;
    }

    // Customer details (online)
    if (!isDineIn) {
      if (customerName?.trim()) message += `*Name:* ${customerName.trim()}\n`;
      if (customerPhone?.trim())
        message += `*Phone:* ${customerPhone.trim()}\n`;
      if (channel === "delivery" && deliveryAddress?.trim()) {
        message += `*Address:* ${deliveryAddress.trim()}\n`;
      }
    }

    // Divider
    message += `\n━━━━━━━━━━━━━━\n`;
    message += `*ITEMS*\n`;

    // Items list
    cartItems.forEach((item, idx) => {
      const lineTotal = money(item.price * item.quantity);
      message += `${idx + 1}) ${item.name}  x${item.quantity}  —  ${lineTotal}\n`;
    });

    // Divider + totals
    message += `━━━━━━━━━━━━━━\n`;
    message += `*Items:* ${totalItems}\n`;
    message += `*Total:* ${money(totalPrice)}\n`;

    // Notes
    if (notes?.trim()) {
      message += `\n *Notes:* ${notes.trim()}\n`;
    }

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const err = validateBeforePlace();
    if (err) {
      setPlaceError(err);
      return;
    }

    if (!restaurantPhone) {
      setPlaceError(
        "WhatsApp ordering is unavailable because the restaurant phone number isn’t set.",
      );
      return;
    }

    setPlaceError("");
    setPlacing(true);

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${message}`;

    // ✅ Use a real <a> click (more reliable than window.open; avoids popup blocker)
    try {
      const a = document.createElement("a");
      a.href = whatsappUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // fallback: navigate in the same tab if needed
      window.location.href = whatsappUrl;
      return;
    }

    // ✅ Clear cart + redirect (current tab)
    setTimeout(() => {
      clearCart();
      router.push("/restaurants");
      setPlacing(false);
    }, 0);
  };

  const handleDec = (item) => {
    if (item.quantity <= 1) return removeFromCart(item.id);
    updateQuantity(item.id, item.quantity - 1);
  };
  const handleInc = (item) => updateQuantity(item.id, item.quantity + 1);

  const clearTableLink = () => {
    if (!restaurant?.slug) return;
    localStorage.removeItem(`tableCode:${restaurant.slug}`);
    setTableCode(null);
    setTableNumber(null); // ✅ clear resolved number too
    setPlaceError("");
    setPlacedOrderId("");
  };

  const validateBeforePlace = () => {
    setPlaceError("");
    if (!restaurant?.slug)
      return "Restaurant is missing. Please go back and open menu again.";
    if (!cartItems?.length) return "Your cart is empty.";

    if (!isDineIn && channel === "delivery") {
      if (!customerPhone.trim())
        return "Please enter phone number for delivery.";
      if (!deliveryAddress.trim()) return "Please enter delivery address.";
    }
    if (!isDineIn && channel === "pickup") {
      if (!customerPhone.trim()) return "Please enter phone number for pickup.";
    }

    if (isDineIn && !tableCode) {
      return "Missing table code. Please scan the table QR again.";
    }

    return "";
  };

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
                  <Link href="/restaurants">Browse restaurants</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="shrink-0">
                <Link href={menuHref}>
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
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </Badge>

                  {restaurant?.name && (
                    <Badge variant="outline" className="gap-1">
                      <Store className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[220px]">
                        {restaurant.name}
                      </span>
                    </Badge>
                  )}

                  <Badge
                    variant={isDineIn ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {isDineIn ? (
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                    ) : (
                      <Bike className="h-3.5 w-3.5" />
                    )}
                    {isDineIn
                      ? "Dine-in"
                      : channel === "delivery"
                        ? "Delivery"
                        : "Pickup"}
                  </Badge>
                </div>

                {isDineIn && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Linked to a table via QR{" "}
                      {tableNumber ? `(Table ${tableNumber})` : "(Table ?)"}.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearTableLink}
                      className="h-7 px-2"
                      title="Use this if you’re ordering online from home"
                    >
                      <Clipboard className="h-3.5 w-3.5 mr-1" />
                      Switch to online
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <Button variant="destructive" className="shrink-0 rounded-full" onClick={clearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 overflow-hidden gap-0">
            <CardHeader className="pb-0">
              <CardTitle className="text-base md:text-lg">Items</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 md:p-5 flex gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                      {item.image_url ? (
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight truncate">
                            {item.name}
                          </p>
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

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Item total
                          </p>
                          <p className="font-bold">
                            {money(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex items-center justify-between gap-3">
                <Button asChild variant="outline">
                  <Link href={menuHref}>Continue shopping</Link>
                </Button>

                <Button
                  variant="destructive"
                  className="w-fit cursor-pointer hover:bg-red-500"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 mr-2" />
                  Clear
                </Button>
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Review your items before ordering
              </div>
            </CardFooter>
          </Card>

          <div className="lg:col-span-4">
            <Card className="lg:sticky lg:top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {!isDineIn && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Order type</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={channel === "pickup" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setChannel("pickup")}
                        disabled={!restaurant?.pickup_available}
                      >
                        Pickup
                      </Button>
                      <Button
                        type="button"
                        variant={channel === "delivery" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setChannel("delivery")}
                        disabled={!restaurant?.delivery_available}
                      >
                        Delivery
                      </Button>
                    </div>
                    {!restaurant?.pickup_available &&
                      !restaurant?.delivery_available && (
                        <p className="text-xs text-muted-foreground">
                          This restaurant has not enabled pickup or delivery.
                        </p>
                      )}
                  </div>
                )}

                {!isDineIn && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Phone *</p>
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9665xxxxxxx"
                        className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Name (optional)</p>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your name"
                        className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                      />
                    </div>

                    {channel === "delivery" && (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Address *
                        </p>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="District, street, building, apartment..."
                          className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-semibold">Notes (optional)</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any instructions..."
                    className="w-full min-h-[70px] rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <Separator />

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
                  <span className="text-xl font-bold text-primary">
                    {money(totalPrice)}
                  </span>
                </div>

                {placeError && (
                  <p className="text-sm text-destructive">{placeError}</p>
                )}

                {placedOrderId && (
                  <p className="text-sm text-green-600">
                    ✅ Order placed! Order ID: {placedOrderId}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-primary hover:bg-green-600 text-white hover:text-white cursor-pointer"
                  onClick={handleWhatsAppOrder}
                  disabled={!restaurantPhone}
                >
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </Button>

                {!restaurantPhone && (
                  <p className="text-xs text-muted-foreground">
                    WhatsApp ordering is unavailable because the restaurant
                    phone number isn’t set.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
