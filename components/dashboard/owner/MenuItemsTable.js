"use client";

import Link from "next/link";
import { Pencil, Trash2, Utensils } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MenuItemsTable({
  menuItems,
  categoryMap,
  onToggleAvailability,
  onToggleSoldOut,
  onDeleteItem,
}) {
  return (
    <div className="hidden md:block">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Menu Items</CardTitle>
          <CardDescription className="text-sm">Toggle availability and sold out status instantly.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[340px]">Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Sold Out</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {menuItems.map((item) => {
                  const soldOut = !!item.is_sold_out;
                  const available = !!item.is_available;

                  return (
                    <TableRow key={item.id} className={soldOut ? "opacity-70" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-10 w-10 rounded-md object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate max-w-[220px]">{item.name}</p>
                              {soldOut && <Badge variant="secondary">Sold Out</Badge>}
                              {!available && <Badge variant="destructive">Unavailable</Badge>}
                            </div>

                            {item.description ? (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[320px]">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{categoryMap[item.category_id] || "Uncategorized"}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={item.is_veg ? "border-green-200 text-green-700" : "border-red-200 text-red-700"}
                        >
                          {item.is_veg ? "Veg" : "Non-veg"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-semibold">SAR {item.price}</TableCell>

                      <TableCell className="text-center">
                        <Switch checked={available} onCheckedChange={() => onToggleAvailability(item.id, item.is_available)} />
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch checked={soldOut} onCheckedChange={() => onToggleSoldOut(item.id, item.is_sold_out)} />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="secondary" className="rounded-full">
                            <Link href={`/dashboard/owner/menu/${item.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>

                          <Button size="sm" variant="destructive" className="rounded-full" onClick={() => onDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
