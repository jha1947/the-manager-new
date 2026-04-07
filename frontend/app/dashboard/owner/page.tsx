export default function OwnerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Platform owner</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Society administration</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Society setup</h2>
              <p className="mt-3 text-sm text-slate-600">Create societies, define wings, floors and flats, and verify admin accounts.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Audit history</h2>
              <p className="mt-3 text-sm text-slate-600">View removed users, full activity history, and restore or link legacy accounts.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
