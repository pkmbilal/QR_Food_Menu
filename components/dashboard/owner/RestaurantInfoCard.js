"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RestaurantInfoCard({ restaurant }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
        <CardTitle className="text-[14px] md:text-base">Restaurant Info</CardTitle>
        <CardDescription className="text-[12px] md:text-sm">
          Quick reference details for customers.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 px-4 md:px-6 pb-4 md:pb-6">
        <InfoRow label="Name" value={restaurant?.name} compact />
        <InfoRow label="Slug" value={`/menu/${restaurant?.slug}`} mono compact />
        <InfoRow label="WhatsApp" value={restaurant?.phone || "Not set"} compact />
        <InfoRow label="Address" value={restaurant?.address || "Not set"} compact />
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, mono = false, compact = false }) {
  return (
    <div className={`rounded-xl border bg-background ${compact ? "p-3" : "p-4"}`}>
      <p className={`${compact ? "text-[11px]" : "text-xs"} text-muted-foreground`}>{label}</p>
      <p
        className={`mt-1 font-medium ${
          mono ? "font-mono text-[12px]" : compact ? "text-[12px]" : ""
        } line-clamp-2`}
      >
        {value}
      </p>
    </div>
  );
}
