"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, getUserProfile, getUserRestaurant, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import OwnerDashboardHeader from "@/components/dashboard/owner/OwnerDashboardHeader";
import OwnerStats from "@/components/dashboard/owner/OwnerStats";
import RestaurantInfoCard from "@/components/dashboard/owner/RestaurantInfoCard";
import OwnerMenuTabs from "@/components/dashboard/owner/OwnerMenuTabs";

export default function OwnerDashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadOwnerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOwnerData() {
    setLoading(true);

    const { user: currentUser, error: userError } = await getCurrentUser();
    if (userError || !currentUser) {
      router.push("/auth/login");
      return;
    }
    setUser(currentUser);

    const { data: userProfile } = await getUserProfile(currentUser.id);
    setProfile(userProfile);

    if (userProfile && userProfile.role !== "owner") {
      router.push("/dashboard");
      return;
    }

    const { data: userRestaurant, error: restaurantError } = await getUserRestaurant(currentUser.id);

    if (restaurantError || !userRestaurant) {
      setLoading(false);
      return;
    }

    setRestaurant(userRestaurant);

    await loadCategories(userRestaurant.id);
    await loadMenuItems(userRestaurant.id);

    setLoading(false);
  }

  async function loadMenuItems(restaurantId) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category_id", { ascending: true });

    if (!error) setMenuItems(data || []);
  }

  async function loadCategories(restaurantId) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true });

    if (!error) setCategories(data || []);
  }

  const categoryMap = useMemo(() => {
    return Object.fromEntries((categories || []).map((c) => [c.id, c.name]));
  }, [categories]);

  const toggleAvailability = async (itemId, currentStatus) => {
    const { error } = await supabase.from("menu_items").update({ is_available: !currentStatus }).eq("id", itemId);
    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
  };

  const toggleSoldOut = async (itemId, currentStatus) => {
    const { error } = await supabase.from("menu_items").update({ is_sold_out: !currentStatus }).eq("id", itemId);
    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
  };

  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
  };

  const renameCategory = async (categoryId, newName) => {
    const clean = newName.trim();
    if (!clean) return { ok: false, message: "Name cannot be empty" };

    const { error } = await supabase.from("categories").update({ name: clean }).eq("id", categoryId);

    if (error) {
      const msg = error.message?.toLowerCase().includes("duplicate")
        ? "This category already exists."
        : error.message;
      return { ok: false, message: msg };
    }

    await loadCategories(restaurant.id);
    return { ok: true };
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm("Delete this category? Items under it will become Uncategorized.")) return;

    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) {
      alert("Failed to delete category: " + error.message);
      return;
    }

    await loadCategories(restaurant.id);
    await loadMenuItems(restaurant.id);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Restaurant Found</CardTitle>
            <CardDescription>Please contact admin for assistance.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <OwnerDashboardHeader restaurant={restaurant} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        <OwnerStats menuItems={menuItems} />

        <RestaurantInfoCard restaurant={restaurant} />

        <OwnerMenuTabs
          restaurant={restaurant}
          menuItems={menuItems}
          categories={categories}
          categoryMap={categoryMap}
          actions={{
            toggleAvailability,
            toggleSoldOut,
            deleteItem,
            renameCategory,
            deleteCategory,
            reloadItems: () => loadMenuItems(restaurant.id),
            reloadCategories: () => loadCategories(restaurant.id),
          }}
        />
      </div>
    </div>
  );
}
