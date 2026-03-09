"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, X } from "lucide-react";

export default function FavoritesCard({ favorites = [], onRemove }) {
  const items = Array.isArray(favorites) ? favorites : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Favorite Restaurants
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-xl border bg-background p-6 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <p className="font-semibold">No favorites yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse restaurants and save your top picks.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/restaurants">
                <ExternalLink className="h-4 w-4 mr-2" />
                Browse Restaurants
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((fav) => {
              // support both possible shapes
              const r = fav?.restaurant || fav?.restaurants;
              const rid = fav?.restaurant_id ?? r?.id;
              const name = r?.name ?? `Restaurant (${rid})`;
              const slug = r?.slug || null;
              const address = r?.address || null;

              const href = slug ? `/menu/${slug}` : "#";

              return (
                <div
                  key={fav?.id ?? `${rid ?? "no-id"}-${slug ?? "no-slug"}`}
                  className="group rounded-xl border bg-background p-4 hover:shadow-sm transition relative"
                >
                  {slug ? (
                    <Link href={href} className="block">
                      <div className="min-w-0">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">
                          {name}
                        </p>
                        {address && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            📍 {address}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                        View Menu <ExternalLink className="h-4 w-4 ml-1" />
                      </div>
                    </Link>
                  ) : (
                    <div className="block">
                      <p className="font-semibold truncate">{name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Restaurant details not loaded
                      </p>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                    title="Remove from favorites"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!rid) return;
                      onRemove?.(rid, name);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
