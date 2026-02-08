"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddCategoryForm({ restaurantId, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Category name is required.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("categories")
      .insert([{ restaurant_id: restaurantId, name: cleanName }]);

    if (dbError) {
      const msg = dbError.message?.toLowerCase().includes("duplicate")
        ? "This category already exists."
        : dbError.message;
      setError(msg);
      setLoading(false);
      return;
    }

    setLoading(false);
    setName("");
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Category Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Biriyani" />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="submit" disabled={loading} className="rounded-full">
          {loading ? "Adding…" : "Add Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}
