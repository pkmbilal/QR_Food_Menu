"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Pencil, Trash2, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { groupItemsByCategory } from "@/components/dashboard/owner/utils";

export default function MenuItemsMobile({
  menuItems,
  categoryMap,
  onToggleAvailability,
  onToggleSoldOut,
  onDeleteItem,
}) {
  const grouped = useMemo(
    () => groupItemsByCategory(menuItems, categoryMap),
    [menuItems, categoryMap],
  );

  return (
    <div className="md:hidden -mx-4">
      {Object.entries(grouped).map(([catName, items]) => (
        <div key={catName} className="mb-6">
          <div className="px-4 py-2">
            <p className="text-[13px] font-semibold text-foreground">
              {catName}{" "}
              <span className="text-muted-foreground font-medium">
                ({items.length} items)
              </span>
            </p>
          </div>

          <div className="space-y-2 px-3">
            {items.map((item) => {
              const soldOut = !!item.is_sold_out;
              const available = !!item.is_available;

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-2xl border bg-background shadow-sm",
                    "p-3",
                    soldOut ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <div className="grid grid-cols-3 gap-3">
                    {/* image */}
                    <div className="relative h-[78px] w-[78px] col-span-1">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full rounded-2xl object-cover border"
                        />
                      ) : (
                        <div className="h-full w-full rounded-2xl border bg-muted flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      {soldOut && (
                        <span className="absolute -top-2 -left-2 text-[10px] font-semibold px-2 py-1 rounded-full bg-background border shadow-sm">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* content */}
                    <div className="min-w-0 col-span-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold leading-tight truncate">
                            {item.name}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span
                              className={`text-[10px] px-2 py-[3px] rounded-full border ${
                                item.is_veg
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {item.is_veg ? "Veg" : "Non-veg"}
                            </span>

                            {!available && (
                              <span className="text-[10px] px-2 py-[3px] rounded-full border bg-red-50 text-red-700 border-red-200">
                                Unavailable
                              </span>
                            )}

                            {available && !soldOut && (
                              <span className="text-[10px] px-2 py-[3px] rounded-full border bg-green-50 text-green-700 border-green-200">
                                Live
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[13px] font-bold text-primary leading-none whitespace-nowrap">
                            SAR {item.price}
                          </p>
                        </div>
                      </div>

                      {item.description ? (
                        <p className="mt-2 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      ) : null}

                    </div>

                    {/* controls */}
                    <div className="col-span-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-2 sm:px-3 h-8 sm:h-9">
                          <span className="text-[11px] font-medium">
                            Live
                          </span>
                          <Switch
                            className="scale-90 sm:scale-100"
                            checked={available}
                            onCheckedChange={() =>
                              onToggleAvailability(item.id, item.is_available)
                            }
                          />
                        </div>

                        <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-2 sm:px-3 h-8 sm:h-9">
                          <span className="text-[11px] font-medium">
                            Sold
                          </span>
                          <Switch
                            className="scale-90 sm:scale-100"
                            checked={soldOut}
                            onCheckedChange={() =>
                              onToggleSoldOut(item.id, item.is_sold_out)
                            }
                          />
                        </div>
                        <Button
                          asChild
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                        >
                          <Link
                            href={`/dashboard/owner/menu/${item.id}/edit`}
                            aria-label="Edit item"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                          onClick={() => onDeleteItem(item.id)}
                          aria-label="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
