"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  getUserProfile,
  getUserRestaurant,
  signOut,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, Receipt, TriangleAlert, Trash2, CheckCircle } from "lucide-react";

import OwnerDashboardHeader from "@/components/dashboard/owner/OwnerDashboardHeader";
import OwnerStats from "@/components/dashboard/owner/OwnerStats";
import RestaurantInfoCard from "@/components/dashboard/owner/RestaurantInfoCard";
import OwnerMenuTabs from "@/components/dashboard/owner/OwnerMenuTabs";

// ✅ NEW components
import OwnerTablesQrTab from "@/components/dashboard/owner/OwnerTablesQrTab";
import OwnerOrdersTab from "@/components/dashboard/owner/OwnerOrdersTab";

// ✅ Shadcn Dialogs
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OwnerDashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // ✅ tables + orders
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [tableCount, setTableCount] = useState(10);
  const [generatingTables, setGeneratingTables] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Dialog States
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogConfig, setInfoDialogConfig] = useState({ title: "", description: "", isError: false });

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

    const { data: userRestaurant, error: restaurantError } =
      await getUserRestaurant(currentUser.id);

    if (restaurantError || !userRestaurant) {
      setLoading(false);
      return;
    }

    setRestaurant(userRestaurant);

    await Promise.all([
      loadCategories(userRestaurant.id),
      loadMenuItems(userRestaurant.id),
      loadTables(userRestaurant.id),
      loadOrders(userRestaurant.id),
    ]);

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

  async function loadTables(restaurantId) {
    setTablesLoading(true);
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("id, table_number, code, is_active, created_at")
      .eq("restaurant_id", restaurantId)
      .order("table_number", { ascending: true });

    if (!error) setTables(data || []);
    setTablesLoading(false);
  }

  async function loadOrders(restaurantId) {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        channel,
        status,
        total,
        customer_name,
        customer_phone,
        delivery_address,
        notes,
        restaurant_tables ( table_number )
      `
      )
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setOrders(data || []);
    setOrdersLoading(false);
  }

  const categoryMap = useMemo(() => {
    return Object.fromEntries((categories || []).map((c) => [c.id, c.name]));
  }, [categories]);

  const toggleAvailability = async (itemId, currentStatus) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", itemId);

    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
  };

  const toggleSoldOut = async (itemId, currentStatus) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_sold_out: !currentStatus })
      .eq("id", itemId);

    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
  };

  // ✅ Trigger Delete Item Dialog
  const deleteItem = (itemId) => {
    setItemToDelete(itemId);
    setDeleteItemOpen(true);
  };

  // ✅ Confirm Delete Item
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", itemToDelete);
    if (!error && restaurant?.id) loadMenuItems(restaurant.id);
    setDeleteItemOpen(false);
    setItemToDelete(null);
  };

  const renameCategory = async (categoryId, newName) => {
    const clean = newName.trim();
    if (!clean) return { ok: false, message: "Name cannot be empty" };

    const { error } = await supabase
      .from("categories")
      .update({ name: clean })
      .eq("id", categoryId);

    if (error) {
      const msg = error.message?.toLowerCase().includes("duplicate")
        ? "This category already exists."
        : error.message;
      return { ok: false, message: msg };
    }

    await loadCategories(restaurant.id);
    return { ok: true };
  };

  // ✅ Trigger Delete Category Dialog
  const deleteCategory = (categoryId) => {
    setCategoryToDelete(categoryId);
    setDeleteCategoryOpen(true);
  };

  // ✅ Confirm Delete Category
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete);
    if (error) {
      setInfoDialogConfig({
        title: "Error",
        description: "Failed to delete category: " + error.message,
        isError: true,
      });
      setInfoDialogOpen(true);
    } else {
      await loadCategories(restaurant.id);
      await loadMenuItems(restaurant.id);
    }
    setDeleteCategoryOpen(false);
    setCategoryToDelete(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleGenerateTables = async () => {
    if (!restaurant?.id) return;

    const n = Number(tableCount || 0);
    if (!n || n < 1 || n > 200) {
      setInfoDialogConfig({
        title: "Invalid Input",
        description: "Please enter a valid number of tables (1 to 200).",
        isError: true,
      });
      setInfoDialogOpen(true);
      return;
    }

    setGeneratingTables(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;

      const res = await fetch(`/api/restaurants/${restaurant.id}/tables/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ count: n }),
      });

      const json = await res.json();
      if (!res.ok) {
        setInfoDialogConfig({
          title: "Error",
          description: json?.error || "Failed to generate tables.",
          isError: true,
        });
        setInfoDialogOpen(true);
        return;
      }

      await loadTables(restaurant.id);
      setInfoDialogConfig({
        title: "Success",
        description: `✅ Tables generated (created: ${json.created ?? 0})`,
        isError: false,
      });
      setInfoDialogOpen(true);
    } catch (e) {
      setInfoDialogConfig({
        title: "Error",
        description: e?.message || "Server error generating tables.",
        isError: true,
      });
      setInfoDialogOpen(true);
    } finally {
      setGeneratingTables(false);
    }
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

        {/* ✅ your existing Menu/Categories tabs unchanged */}
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

        {/* ✅ Tables & Orders tabs */}
        <Tabs defaultValue="tables" className="w-full">
          <div className="flex items-center justify-between gap-3">
            <TabsList className="w-fit">
              <TabsTrigger value="tables" className="gap-2">
                <QrCode className="h-4 w-4" />
                Tables & QR
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tables" className="mt-4">
            <OwnerTablesQrTab
              restaurant={restaurant}
              tables={tables}
              tablesLoading={tablesLoading}
              tableCount={tableCount}
              setTableCount={setTableCount}
              generatingTables={generatingTables}
              onGenerateTables={handleGenerateTables}
              onRefreshTables={() => loadTables(restaurant.id)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ✅ Delete Item Dialog */}
      <AlertDialog open={deleteItemOpen} onOpenChange={setDeleteItemOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-5 w-5" />
              Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Delete Category Dialog */}
      <AlertDialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-5 w-5" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete this category? Items under it will become Uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Info/Error Dialog */}
      <AlertDialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={`flex items-center gap-2 ${infoDialogConfig.isError ? "text-destructive" : "text-green-600"}`}>
              {infoDialogConfig.isError ? <TriangleAlert className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              {infoDialogConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {infoDialogConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInfoDialogOpen(false)}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
