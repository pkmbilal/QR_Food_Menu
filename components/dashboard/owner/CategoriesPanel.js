"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CategoryPill from "@/components/dashboard/owner/CategoryPill";

export default function CategoriesPanel({ categories, onRename, onDelete }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Categories</CardTitle>
        <CardDescription className="text-sm">
          Rename or remove categories. Items become Uncategorized if deleted.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {categories.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No categories yet. Add one to organize your menu.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                category={c}
                onRename={onRename}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
