"use client";

import { Utensils, Layers, Ban, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OwnerStats({ menuItems }) {
  const total = menuItems?.length || 0;
  const availableCount = (menuItems || []).filter((i) => i.is_available).length;
  const unavailableCount = (menuItems || []).filter((i) => !i.is_available).length;
  const soldOutCount = (menuItems || []).filter((i) => i.is_sold_out).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard title="Total" value={total} icon={<Utensils className="h-5 w-5" />} />
      <StatCard
        title="Available"
        value={availableCount}
        icon={<BadgeCheck className="h-5 w-5" />}
        valueClass="text-green-600"
      />
      <StatCard
        title="Unavailable"
        value={unavailableCount}
        icon={<Ban className="h-5 w-5" />}
        valueClass="text-red-600"
      />
      <StatCard title="Sold Out" value={soldOutCount} icon={<Layers className="h-5 w-5" />} />
    </div>
  );
}

function StatCard({ title, value, icon, valueClass = "" }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 md:p-5 flex items-center justify-between">
        <div>
          <p className="text-[12px] md:text-sm text-muted-foreground">{title}</p>
          <p className={`text-[18px] md:text-2xl font-semibold mt-1 ${valueClass}`}>{value}</p>
        </div>
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
