import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { restaurantId, tableCode } = await req.json();

    if (!restaurantId || !tableCode) {
      return NextResponse.json(
        { error: "Missing restaurantId or tableCode" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("restaurant_tables")
      .select("table_number")
      .eq("restaurant_id", restaurantId)
      .eq("code", tableCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ tableNumber: data?.table_number ?? null });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
