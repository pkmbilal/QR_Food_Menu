import { supabase } from "@/lib/supabase";
import RestaurantCard from "@/components/RestaurantCard";

export default async function RestaurantsPage() {
  // Fetch active restaurants + join city name
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select(
      `
    id,
    slug,
    name,
    address,
    image_url,
    is_active,
    city_id,
    cities:city_id (
      id,
      name
    )
  `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) console.log("Restaurants fetch error:", error);

  return (
    <>
      {/* Featured Restaurants */}
      <section id="restaurants" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing restaurants near you
            </p>
          </div>

          {restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-xl text-gray-600">
                No restaurants yet. Be the first!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
