"use client";

import Link from "next/link";
import { Store, QrCode, Pencil, LogOut, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerDashboardHeader({ restaurant, onLogout }) {
  return (
    <div className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* MOBILE */}
        <div className="md:hidden flex items-start gap-2 min-w-0">
          <Store className="h-5 w-5 text-primary shrink-0 mt-[1px]" />

          <div className="min-w-0 flex flex-col leading-tight">
            <p className="text-[15px] font-semibold truncate">
              {restaurant?.name}
            </p>
            <p className="text-muted-foreground text-[13px] font-medium truncate">
              Owner Dashboard
            </p>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {restaurant?.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Owner Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <Link href={`/menu/${restaurant?.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Menu
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <Link href={`/qr/${restaurant?.slug}`}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Link>
            </Button>

            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard/owner/restaurant/edit">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* MOBILE pills */}
        <div className="md:hidden mt-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0 h-9 px-4"
            >
              <Link href={`/menu/${restaurant?.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                Menu
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0 h-9 px-4"
            >
              <Link href={`/qr/${restaurant?.slug}`}>
                <QrCode className="h-4 w-4 mr-2" />
                QR
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="rounded-full shrink-0 h-9 px-4"
            >
              <Link href="/dashboard/owner/restaurant/edit">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="rounded-full shrink-0 h-9 px-4"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
