"use client";

import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, authSession) => {
      setSession(authSession);
      if (!authSession) {
        router.push("/login");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-slate-50 p-8">Loading authentication…</div>;
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-slate-50 p-8">Redirecting to login…</div>;
  }

  return <>{children}</>;
}
