"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoryPill({ category, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setName(category.name), [category.name]);

  const save = async () => {
    setError("");
    setSaving(true);

    const res = await onRename(category.id, name);

    setSaving(false);

    if (!res?.ok) {
      setError(res?.message || "Failed to rename");
      return;
    }

    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm">
      {!editing ? (
        <>
          <span className="text-sm font-medium">{category.name}</span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full"
            onClick={() => setEditing(true)}
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full text-red-600 hover:text-red-700"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-40 rounded-full" autoFocus />

          <Button type="button" size="icon" className="h-7 w-7 rounded-full" onClick={save} disabled={saving} title="Save">
            <Check className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7 rounded-full"
            onClick={() => {
              setEditing(false);
              setName(category.name);
              setError("");
            }}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}

      {error ? <span className="text-xs text-red-600 ml-1">{error}</span> : null}
    </div>
  );
}
