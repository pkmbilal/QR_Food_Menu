"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AddCategoryDialog from "@/components/dashboard/owner/dialogs/AddCategoryDialog";
import AddItemDialog from "@/components/dashboard/owner/dialogs/AddItemDialog";

import MenuItemsMobile from "@/components/dashboard/owner/MenuItemsMobile";
import MenuItemsTable from "@/components/dashboard/owner/MenuItemsTable";
import CategoriesPanel from "@/components/dashboard/owner/CategoriesPanel";

export default function OwnerMenuTabs({ restaurant, menuItems, categories, categoryMap, actions }) {
  return (
    <Tabs defaultValue="items" className="w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="rounded-full">
          <TabsTrigger value="items" className="rounded-full">
            Menu Items
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full">
            Categories
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <AddCategoryDialog restaurantId={restaurant.id} onAdded={actions.reloadCategories} />
          <AddItemDialog restaurantId={restaurant.id} categories={categories} onAdded={actions.reloadItems} />
        </div>
      </div>

      <Separator className="my-4" />

      <TabsContent value="items">
        {menuItems.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No items yet. Add your first item ✨
          </div>
        ) : (
          <>
            <MenuItemsMobile
              menuItems={menuItems}
              categoryMap={categoryMap}
              onToggleAvailability={actions.toggleAvailability}
              onToggleSoldOut={actions.toggleSoldOut}
              onDeleteItem={actions.deleteItem}
            />

            <MenuItemsTable
              menuItems={menuItems}
              categoryMap={categoryMap}
              onToggleAvailability={actions.toggleAvailability}
              onToggleSoldOut={actions.toggleSoldOut}
              onDeleteItem={actions.deleteItem}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesPanel categories={categories} onRename={actions.renameCategory} onDelete={actions.deleteCategory} />
      </TabsContent>
    </Tabs>
  );
}
