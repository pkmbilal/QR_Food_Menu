  "use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function AddItemForm({ restaurantId, categories, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    is_available: true,
    is_veg: true,
    is_sold_out: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const priceNum = Number.parseFloat(form.price);
    if (Number.isNaN(priceNum)) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("menu_items").insert([
      {
        restaurant_id: restaurantId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        category_id: form.category_id || null,
        image_url: form.image_url?.trim() || null,
        is_available: !!form.is_available,
        is_veg: !!form.is_veg,
        is_sold_out: !!form.is_sold_out,
      },
    ]);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Item Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Chicken Mandi"
            required
          />
        </div>
        
        {/* Mobile Only Block */}
        <div className="md:hidden grid grid-cols-2 gap-2">
          <div className="space-y-2 col-span-1">
          <Label>Price (SAR)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="12.00"
            required
          />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-1">
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger className={'w-full'}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">Add a category first to create items.</p>
            ) : null}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2 hidden md:block">
          <Label>Price (SAR)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="12.00"
            required
          />
        </div>

        <div className="hidden md:block space-y-2 md:col-span-1">
          <Label>Category</Label>
          <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add a category first to create items.</p>
          ) : null}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description…"
            required
          />
        </div>

        <div className="hidden space-y-2 md:col-span-1">
          <Label>Category</Label>
          <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add a category first to create items.</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label>Image URL (optional)</Label>
          <Input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-none !py-4">
          <CardContent className="p-1 flex flex-col items-center md:justify-center justify-between gap-2">
            <div className="md:text-center">
              <p className="text-sm font-medium">Available</p>
              <p className="hidden sm:block text-xs text-muted-foreground">Shown to customers</p>
            </div>
            <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
          </CardContent>
        </Card>

        <Card className="shadow-none !py-4">
          <CardContent className="p-1 flex flex-col items-center justify-between gap-2">
            <div className="md:text-center">
              <p className="text-sm font-medium">Veg</p>
              <p className="hidden sm:block text-xs text-muted-foreground">{form.is_veg ? "Veg item" : "Non-veg item"}</p>
            </div>
            <Switch checked={form.is_veg} onCheckedChange={(v) => setForm({ ...form, is_veg: v })} />
          </CardContent>
        </Card>

        <Card className="shadow-none !py-4">
          <CardContent className="p-1 flex flex-col items-center justify-between gap-2">
            <div className="md:text-center">
              <p className="text-sm font-medium">Sold Out</p>
              <p className="hidden sm:blocktext-xs text-muted-foreground">Disables add button</p>
            </div>
            <Switch checked={form.is_sold_out} onCheckedChange={(v) => setForm({ ...form, is_sold_out: v })} />
          </CardContent>
        </Card>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={loading || categories.length === 0} className="rounded-full">
          {loading ? "Adding…" : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  );
}
