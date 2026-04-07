"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUserProfile, updateUserProfile } from "@/lib/userProfile";
import { supabase } from "@/lib/supabaseClient";
import type { Role } from "@/lib/types";
import type { UserProfile } from "@/lib/userProfile";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      experience: formData.get("experience") as string,
    };

    const updated = await updateUserProfile(updates);
    if (updated) {
      setUserProfile(updated);
      setMessage("Profile updated successfully!");
    } else {
      setMessage("Failed to update profile. Please try again.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50 p-8">Loading profile…</div>
      </AuthGuard>
    );
  }

  if (!userProfile) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50 p-8">Profile not found.</div>
      </AuthGuard>
    );
  }

  const role = userProfile.role as Role;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar role={role} activePage="/dashboard/profile" />
          <main className="space-y-8 px-6 py-8 sm:px-10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Profile</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage your profile</h1>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <form onSubmit={handleSave} className="card">
                  <h2 className="text-xl font-semibold text-slate-950">Personal Information</h2>

                  <div className="mt-6 space-y-6">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Full Name</span>
                      <input
                        name="name"
                        type="text"
                        defaultValue={userProfile.name}
                        required
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Mobile Number</span>
                      <input
                        type="tel"
                        value={userProfile.mobile}
                        disabled
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">Mobile number cannot be changed</p>
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Bio</span>
                      <textarea
                        name="bio"
                        rows={3}
                        defaultValue={userProfile.bio || ""}
                        placeholder="Tell us about yourself..."
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    {(role === "manager") && (
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Experience</span>
                        <textarea
                          name="experience"
                          rows={3}
                          defaultValue={userProfile.experience || ""}
                          placeholder="Describe your experience and skills..."
                          className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={saving} className="button-primary">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>

                  {message && (
                    <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                      {message}
                    </p>
                  )}
                </form>
              </div>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-950">Account Status</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Role</span>
                      <span className="text-sm font-medium text-slate-900 capitalize">{userProfile.role.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className={`text-sm font-medium ${userProfile.is_active ? "text-green-600" : "text-red-600"}`}>
                        {userProfile.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Verified</span>
                      <span className={`text-sm font-medium ${userProfile.is_verified ? "text-green-600" : "text-orange-600"}`}>
                        {userProfile.is_verified ? "Yes" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {userProfile.society_id && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-950">Society Details</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Society ID</span>
                        <span className="text-sm font-medium text-slate-900">{userProfile.society_id}</span>
                      </div>
                      {userProfile.wing_id && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Wing ID</span>
                          <span className="text-sm font-medium text-slate-900">{userProfile.wing_id}</span>
                        </div>
                      )}
                      {userProfile.flat_id && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Flat ID</span>
                          <span className="text-sm font-medium text-slate-900">{userProfile.flat_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

