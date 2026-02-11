"use client";

import { useEffect } from "react";

export default function TableCodePersist({ restaurantSlug }) {
  useEffect(() => {
    if (!restaurantSlug || typeof window === "undefined") return;

    const key = `tableCode:${restaurantSlug}`;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("t");

    if (t) {
      // ✅ dine-in (scanned QR)
      localStorage.setItem(key, t);
    } else {
      // ✅ online (normal browsing) -> clear stale table code
      localStorage.removeItem(key);
    }
  }, [restaurantSlug]);

  return null;
}
