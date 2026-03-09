// lib/auth.js  (SERVER-ONLY / ADMIN-ONLY)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// 🔥 MUST be service role key (NEVER expose to browser)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase server env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
}

// Server/admin client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin: Update user role
export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

// Admin: Disable/Enable user
export async function toggleUserStatus(userId, isActive) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

// Admin: Delete user (also deletes from auth.users)
export async function deleteUser(userId) {
  // 1) delete profile (optional if you have FK cascade from auth.users -> user_profiles)
  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .delete()
    .eq("id", userId);

  if (profileError) return { error: profileError };

  // 2) delete auth user
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { data, error };
}