import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  const platformOwnerName = process.env.PLATFORM_OWNER_NAME ?? "Platform Owner";
  const platformOwnerMobile = process.env.PLATFORM_OWNER_MOBILE ?? "+911234567890";
  const supabaseAdmin = createSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase service key is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    );
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("mobile", platformOwnerMobile)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ created: false, user: existing });
  }

  const { data, error } = await supabaseAdmin.from("users").insert([
    {
      name: platformOwnerName,
      mobile: platformOwnerMobile,
      role: "platform_owner",
      is_active: true,
      is_verified: true,
      otp_verified: true,
      created_at: new Date().toISOString()
    }
  ]).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ created: true, user: data });
}
