import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { RoleBadge } from "@/components/RoleBadge";
import { ProfileSync } from "@/components/ProfileSync";
import { getCurrentUserProfile } from "@/lib/userProfile";
import { getDashboardStats } from "@/lib/dashboardData";
import type { Role, DashboardCard, DashboardStats } from "@/lib/types";

const sampleCards: DashboardCard[] = [
  { title: "Pending Bills", value: "24", description: "Outstanding maintenance due" },
  { title: "Open Complaints", value: "8", description: "Complaints assigned to your team" },
  { title: "Wallet Balance", value: "₹ 12,400", description: "Available points and credits" }
];

export default async function DashboardPage() {
  const userProfile = await getCurrentUserProfile();
  const role = (userProfile?.role || "admin") as Role;
  const societyId = userProfile?.society_id;

  let dashboardStats: DashboardStats = { cards: sampleCards, recentActivity: [], alerts: [] };
  if (userProfile && societyId) {
    dashboardStats = await getDashboardStats(role, societyId);
  }


  return (
    <AuthGuard>
      <ProfileSync />
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar role={role} activePage="/dashboard" />
          <main className="space-y-8 px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Welcome back</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">
                  {userProfile?.name ? `${userProfile.name}'s Dashboard` : "Dashboard"}
                </h1>
              </div>
              <RoleBadge role={role} />
            </div>

            <section className="grid gap-6 md:grid-cols-3">
              {dashboardStats.cards.map((card) => (
                <div key={card.title} className="card">
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">{card.title}</p>
                  <p className="mt-4 text-4xl font-semibold text-slate-950">{card.value}</p>
                  <p className="mt-3 text-sm text-slate-600">{card.description}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Today's actions</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Society operations</h2>
                  </div>
                  <Link href="/dashboard/reports" className="button-secondary text-sm">View Analytics →</Link>
                </div>
                <ul className="mt-6 space-y-4 text-sm text-slate-600">
                  {role === "admin" && (
                    <>
                      <li>Generate maintenance bills and manage UPI QR payments</li>
                      <li>View resident complaints, assign managers and tasks</li>
                      <li>Approve expense flows for common and wing-level spending</li>
                    </>
                  )}
                  {role === "sub_admin" && (
                    <>
                      <li>Verify resident maintenance payments</li>
                      <li>Approve or reject expense submissions</li>
                      <li>Review and verify admin reports</li>
                    </>
                  )}
                  {role === "manager" && (
                    <>
                      <li>Complete assigned daily work tasks</li>
                      <li>Handle resident complaints and updates</li>
                      <li>Track work logs and service requests</li>
                    </>
                  )}
                  {role === "resident" && (
                    <>
                      <li>Pay maintenance bills and upload proofs</li>
                      <li>Raise complaints with attachments</li>
                      <li>Participate in voting and view wallet balance</li>
                    </>
                  )}
                  {role === "platform_owner" && (
                    <>
                      <li>Create and manage housing societies</li>
                      <li>Verify admin accounts and oversee operations</li>
                      <li>Access full audit history and removed users</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="card">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent activity</p>
                <div className="mt-4 space-y-4">
                  {dashboardStats.recentActivity.length > 0 ? (
                    dashboardStats.recentActivity.map((activity, index) => (
                      <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-950">{activity.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">No recent activity</p>
                      <p className="mt-2 text-sm text-slate-600">Your recent actions will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

