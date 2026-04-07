import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { RoleBadge } from "@/components/RoleBadge";

const sampleCards = [
  { title: "Pending Bills", value: "24", description: "Outstanding maintenance due" },
  { title: "Open Complaints", value: "8", description: "Complaints assigned to your team" },
  { title: "Wallet Balance", value: "₹ 12,400", description: "Available points and credits" }
];

export default function DashboardPage() {
  const role = "admin" as const;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar role={role} activePage="/dashboard" />
          <main className="space-y-8 px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Welcome back</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">Admin dashboard</h1>
              </div>
              <RoleBadge role={role} />
            </div>

            <section className="grid gap-6 md:grid-cols-3">
              {sampleCards.map((card) => (
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
                  <Link href="/reports" className="button-secondary text-sm">Open reports</Link>
                </div>
                <ul className="mt-6 space-y-4 text-sm text-slate-600">
                  <li>Generate maintenance bills and manage UPI QR payments</li>
                  <li>View resident complaints, assign managers and tasks</li>
                  <li>Approve expense flows for common and wing-level spending</li>
                </ul>
              </div>
              <div className="card">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Announcements</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">New society mapping workflow</p>
                    <p className="mt-2 text-sm text-slate-600">Create wings, floors, and flats for each society in a single flow.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Realtime alerts</p>
                    <p className="mt-2 text-sm text-slate-600">Resident payments, manager reviews and expense approvals are tracked live.</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
