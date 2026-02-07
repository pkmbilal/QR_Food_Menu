"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RestaurantsFilters({ cities = [], cuisines = [] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [type, setType] = useState(sp.get("type") || "restaurants"); // restaurants | food
  const [q, setQ] = useState(sp.get("q") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [cuisine, setCuisine] = useState(sp.get("cuisine") || "");
  const [veg, setVeg] = useState(sp.get("veg") === "1");

  useEffect(() => {
    setType(sp.get("type") || "restaurants");
    setQ(sp.get("q") || "");
    setCity(sp.get("city") || "");
    setCuisine(sp.get("cuisine") || "");
    setVeg(sp.get("veg") === "1");
  }, [sp]);

  const apply = (next) => {
    const params = new URLSearchParams(sp.toString());

    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === null || v === undefined || v === false)
        params.delete(k);
      else params.set(k, String(v));
    });

    params.delete("page");
    router.push(`/restaurants?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/restaurants");
  };

  return (
    <div className="w-full bg-white border rounded-2xl p-4 md:p-5 shadow-sm">
      {/* keep in one line on desktop */}
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-3 md:items-end">
        {/* Search Type */}
        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Search For
          </label>
          <select
            value={type}
            onChange={(e) => {
              const v = e.target.value;
              setType(v);
              apply({ type: v });
            }}
            className="w-full h-11 px-3 border rounded-xl bg-white"
          >
            <option value="restaurants">Restaurants</option>
            <option value="food">Food</option>
          </select>
        </div>

        {/* Search (smaller width now) */}
        <div className="w-full md:w-[300px]">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            {type === "food" ? "Food name" : "Restaurant name"}
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply({ q: q.trim() });
            }}
            placeholder={
              type === "food" ? "e.g., biriyani..." : "e.g., Pizza Palace..."
            }
            className="w-full h-11 px-4 border rounded-xl"
          />
        </div>

        {/* City */}
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            City
          </label>
          <select
            value={city}
            onChange={(e) => {
              const v = e.target.value;
              setCity(v);
              apply({ city: v });
            }}
            className="w-full h-11 px-3 border rounded-xl bg-white"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cuisine */}
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Cuisine
          </label>
          <select
            value={cuisine}
            onChange={(e) => {
              const v = e.target.value;
              setCuisine(v);
              apply({ cuisine: v });
            }}
            className="w-full h-11 px-3 border rounded-xl bg-white"
          >
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vegetarian toggle */}
        <div className="w-full md:w-[75px]">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Vegetarian
          </label>

          {/* ✅ small padding so it doesn't look squeezed */}
          <div className="h-11 border rounded-xl px-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const next = !veg;
                setVeg(next);
                apply({ veg: next ? "1" : "" });
              }}
              aria-pressed={veg}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                veg ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  veg ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Buttons (always one line) */}
        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
          <button
            type="button"
            onClick={() => apply({ q: q.trim() })}
            className="h-11 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-green-600 transition flex-1 md:flex-none"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="h-11 px-4 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition flex-1 md:flex-none"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Tip: Choose <b>Food</b> to find restaurants that have that item in their
        menu.
      </p>
    </div>
  );
}
