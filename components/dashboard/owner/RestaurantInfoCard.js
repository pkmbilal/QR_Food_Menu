"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Phone, Link2, MapPin } from "lucide-react";

export default function RestaurantInfoCard({ restaurant }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
        <CardTitle className="text-[14px] md:text-base">Restaurant Info</CardTitle>
        <CardDescription className="text-[12px] md:text-sm">
          Quick reference details for customers.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {/* Full width */}
          <InfoRow
            icon={Store}
            label="Name"
            value={restaurant?.name || "Not set"}
            className="md:col-span-2"
            compact
          />

          {/* Two columns */}
          <InfoRow
            icon={Phone}
            label="WhatsApp"
            value={restaurant?.phone || "Not set"}
            compact
          />
          <InfoRow
            icon={Link2}
            label="Slug"
            value={restaurant?.slug ? `/menu/${restaurant.slug}` : "Not set"}
            mono
            compact
          />

          {/* Full width */}
          <InfoRow
            icon={MapPin}
            label="Address"
            value={restaurant?.address || "Not set"}
            className="md:col-span-2"
            compact
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false, compact = false, className = "" }) {
  const isEmpty = !value || value === "Not set";

  return (
    <div
      className={[
        "rounded-2xl border bg-background",
        compact ? "p-3" : "p-4",
        "flex items-start gap-3",
        className,
      ].join(" ")}
    >
      {/* Icon chip */}
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border bg-muted/40 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`${compact ? "text-[11px]" : "text-xs"} text-muted-foreground`}>
          {label}
        </p>
        <p
          className={[
            "mt-1 line-clamp-2 font-medium",
            mono ? "font-mono text-[12px]" : compact ? "text-[12px]" : "",
            isEmpty ? "text-muted-foreground" : "",
          ].join(" ")}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}