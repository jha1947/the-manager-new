"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { syncUserProfile } from "@/lib/userProfile";

export function ProfileSync() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncProfile = async () => {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only sync if we haven't already synced this session
      const hasSynced = sessionStorage.getItem("profile_synced");
      if (hasSynced) {
        setSynced(true);
        return;
      }

      try {
        await syncUserProfile(user);
        sessionStorage.setItem("profile_synced", "true");
        setSynced(true);
      } catch (error) {
        console.error("Profile sync failed:", error);
      }
    };

    syncProfile();
  }, []);

  // This component doesn't render anything visible
  return null;
}
