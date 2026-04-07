import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

export function createSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}
