import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // important because we use crypto

const makeCode = () => crypto.randomBytes(6).toString("base64url"); // URL-safe

export async function POST(req, context) {
  try {
    // ✅ Next.js: params can be a Promise
    const p = context?.params;
    const { restaurantId } = p && typeof p.then === "function" ? await p : p;

    const { count } = await req.json(); // e.g. { count: 10 }

    // ✅ Verify user (owner) using access token
    const authHeader = req.headers.get("authorization") || "";

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: uErr } = await supabaseUser.auth.getUser();
    const userId = userData?.user?.id;

    if (uErr || !userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ Check restaurant belongs to owner
    const { data: restaurant, error: rErr } = await supabaseAdmin
      .from("restaurants")
      .select("id, owner_id")
      .eq("id", restaurantId)
      .single();

    if (rErr || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (restaurant.owner_id !== userId) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // ✅ Load existing tables
    const { data: existing, error: eErr } = await supabaseAdmin
      .from("restaurant_tables")
      .select("table_number")
      .eq("restaurant_id", restaurantId);

    if (eErr) {
      return NextResponse.json({ error: eErr.message }, { status: 400 });
    }

    const existingNums = new Set((existing || []).map((t) => t.table_number));

    const nCount = Number(count || 0);
    if (!nCount || nCount < 1) {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }

    const rows = [];
    for (let n = 1; n <= nCount; n++) {
      if (existingNums.has(n)) continue;
      rows.push({
        restaurant_id: restaurantId,
        table_number: n,
        code: makeCode(),
      });
    }

    if (rows.length) {
      const { error: insErr } = await supabaseAdmin.from("restaurant_tables").insert(rows);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, created: rows.length });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
