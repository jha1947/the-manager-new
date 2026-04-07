import { supabase } from "@/lib/supabaseClient";
import type { Role } from "@/lib/types";

export interface UserProfile {
  id: string;
  auth_user_id: string;
  name: string;
  mobile: string;
  role: Role;
  resident_type?: string;
  society_id?: string;
  wing_id?: string;
  floor_id?: string;
  flat_id?: string;
  profile_photo?: string;
  bio?: string;
  experience?: string;
  is_active: boolean;
  is_verified: boolean;
  otp_verified: boolean;
  created_at: string;
  removed_at?: string;
  removal_reason?: string;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function syncUserProfile(user: any, profileData?: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking existing user:", fetchError);
    return null;
  }

  if (existing) {
    // Update existing profile
    const { data, error } = await supabase
      .from("users")
      .update({
        name: profileData?.name || user.user_metadata?.name || existing.name,
        mobile: profileData?.mobile || user.phone || existing.mobile,
        otp_verified: true,
        ...profileData
      })
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from("users")
      .insert({
        auth_user_id: user.id,
        name: profileData?.name || user.user_metadata?.name || "New User",
        mobile: profileData?.mobile || user.phone || "",
        role: profileData?.role || "resident",
        is_active: true,
        is_verified: false,
        otp_verified: true,
        ...profileData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return null;
    }

    return data;
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("auth_user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data;
}
