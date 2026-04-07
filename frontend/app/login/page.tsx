"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { syncUserProfile } from "@/lib/userProfile";

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!supabase) {
      setMessage("Supabase is not configured. Please set environment variables.");
      setLoading(false);
      return;
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(mobile)) {
      setMessage("Please enter a valid phone number in E.164 format (e.g., +911234567890).");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: mobile,
        options: {
          shouldCreateUser: true,
          data: {
            role: "resident"
          }
        }
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("OTP sent. Please check your mobile and verify the link.");
        // Note: Profile sync will happen after OTP verification in the dashboard
        router.push("/dashboard");
      }
    } catch (fetchError) {
      console.error("Supabase OTP request failed", fetchError);
      setMessage(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to connect to Supabase. Check your Supabase URL and anon key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-950">Login with OTP</h1>
        <p className="mt-3 text-slate-600">Enter your mobile number to receive a Supabase OTP message.</p>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <label className="block text-sm font-medium text-slate-700">
            Mobile number
            <input
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              type="tel"
              placeholder="+911234567890"
              required
              className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button type="submit" disabled={loading} className="button-primary w-full">
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}

