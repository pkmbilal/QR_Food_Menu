import Link from "next/link";
import { supabase } from "@/lib/supabase";

import MenuClient from "@/components/MenuClient";
import CartButton from "@/components/CartButton";
import FavoriteButton from "@/components/FavoriteButton";
import TableCodePersist from "@/components/TableCodePersist";
import { QrCode, Phone } from "lucide-react";

export default async function MenuPage({ params, searchParams }) {
  const { restaurantSlug } = await params;

  const sp = await searchParams; // ✅ important in Next 15+
  const tableCode = (sp?.t ?? "").toString();

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select(`
      *,
      city:cities ( id, name ),
      restaurant_cuisines (
        cuisine:cuisines ( id, name )
      )
    `)
    .eq("slug", restaurantSlug)
    .single();

  if (restaurantError || !restaurant) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Restaurant not found</h1>
        <p className="text-muted-foreground mt-2">
          This restaurant may be unavailable or the link is incorrect.
        </p>
        <Link href="/restaurants" className="underline mt-4 inline-block">
          Back to restaurants
        </Link>
      </div>
    );
  }

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select(`
      *,
      categories:categories ( id, name )
    `)
    .eq("restaurant_id", restaurant.id)
    .order("category_id", { ascending: true })
    .order("is_sold_out", { ascending: true, nullsFirst: true })
    .order("name", { ascending: true });

  if (itemsError) console.error("menu_items error:", itemsError);

  const menuItems = itemsError ? [] : items || [];

  const cityName = restaurant?.city?.name || "";

  const cuisinePills =
    restaurant?.restaurant_cuisines
      ?.map((rc) => rc?.cuisine?.name)
      .filter(Boolean) || [];

  const Pill = ({ children, className = "" }) => (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs md:text-sm font-semibold",
        "border-white/20 bg-black/30 text-white backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );

  return (
    <div className="min-h-screen">
      {/* ✅ Persist/clear table code based on URL */}
      <TableCodePersist restaurantSlug={restaurantSlug} />

      {/* HEADER */}
      <div className="relative overflow-hidden text-white">
        {restaurant.image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.image_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700" />
        )}

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/60" />

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 py-5 md:px-7 md:py-7 shadow-xl">
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  {restaurant.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill className="bg-emerald-500/25 border-emerald-300/30">
                    🟢 Open now
                  </Pill>

                  {cityName && <Pill className="bg-white/10">📍 {cityName}</Pill>}

                  {restaurant.delivery_available && (
                    <Pill className="bg-white/10">🚚 Delivery</Pill>
                  )}
                  {restaurant.pickup_available && (
                    <Pill className="bg-white/10">🧍 Pickup</Pill>
                  )}

                  {cuisinePills.slice(0, 8).map((c) => (
                    <Pill key={c} className="bg-white/10">
                      🍽️ {c}
                    </Pill>
                  ))}

                  {cuisinePills.length === 0 && (
                    <Pill className="bg-white/10">🍽️ Multi-cuisine</Pill>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {restaurant.address && (
                    <p className="text-white/90 text-base md:text-lg flex items-start gap-2">
                      <span className="mt-0.5">📍</span>
                      <span className="leading-snug">{restaurant.address}</span>
                    </p>
                  )}

                  {restaurant.phone && (
                    <p className="text-white/95 text-base md:text-lg flex items-center gap-2">
                      <Phone size={18} className="shrink-0" />
                      <span>{restaurant.phone}</span>
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <FavoriteButton restaurantId={restaurant.id} />

                  <Link
                    href={`/qr/${restaurant.slug}`}
                    className="w-fit rounded-xl bg-white/95 text-green-700 px-4 py-2 font-semibold transition hover:bg-white hover:shadow-xl flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    Get QR Code
                  </Link>

                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="w-fit rounded-xl bg-white/10 border border-white/20 px-4 py-2 font-semibold hover:bg-white/15 transition flex items-center gap-2"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}
                </div>
              </div>

              <div className="h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MenuClient
          items={menuItems}
          categories={[
            ...new Set(
              menuItems.map((item) => item?.categories?.name || "Uncategorized")
            ),
          ].sort()}
          restaurant={restaurant}
        />
      </div>

      {/* ✅ pass tableCode so dine-in keeps t into cart */}
      <CartButton restaurant={restaurant} tableCode={tableCode} />
    </div>
  );
}
