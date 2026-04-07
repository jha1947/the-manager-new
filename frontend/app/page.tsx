import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(13,148,136,0.12),_transparent_30%)] px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-500">Housing Society Management</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">The Manager — PWA for Society Operations</h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">Role-based dashboards for platform owner, admin, sub-admin, manager and residents. Built with Next.js, Supabase, Tailwind and PWA support.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="button-primary">Get started</Link>
              <a href="/reports" className="button-secondary">View reports</a>
            </div>
          </div>
          <div className="grid max-w-sm gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Live workflow</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">Complaints, Billing, Tasks & Wallet</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">PWA ready</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">Installable, offline caching, service worker</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
