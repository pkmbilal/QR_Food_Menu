"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OwnerOrdersTab({ restaurant, orders, ordersLoading, onRefreshOrders }) {
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Dine-in orders will show a table number. Online orders show pickup/delivery.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefreshOrders} disabled={ordersLoading}>
            {ordersLoading ? "Refreshing..." : "Refresh Orders"}
          </Button>
        </div>

        {ordersLoading ? (
          <div className="text-sm text-muted-foreground">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="rounded-xl border bg-background overflow-hidden">
            <div className="divide-y">
              {orders.map((o) => {
                const tableNum = o?.restaurant_tables?.table_number;
                const where =
                  o.channel === "dine_in"
                    ? `Table ${tableNum ?? "?"}`
                    : o.channel === "delivery"
                    ? "Delivery"
                    : "Pickup";

                return (
                  <div
                    key={o.id}
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">Order</p>
                        <Badge variant="secondary">{where}</Badge>
                        <Badge variant="outline">{o.status}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(o.created_at)} • Total: SAR {Number(o.total || 0).toFixed(2)}
                      </p>

                      {(o.customer_phone || o.delivery_address) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {o.customer_phone ? `📞 ${o.customer_phone}` : ""}{" "}
                          {o.delivery_address ? `• 📍 ${o.delivery_address}` : ""}
                        </p>
                      )}

                      {o.notes && (
                        <p className="text-sm mt-1">
                          <span className="font-semibold">Notes:</span> {o.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground break-all">{o.id}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
