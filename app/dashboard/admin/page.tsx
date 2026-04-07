export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin tools</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Society operations</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Add resident</h2>
              <p className="mt-3 text-sm text-slate-600">Register residents with wing, flat and owner/tenant details.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Generate bills</h2>
              <p className="mt-3 text-sm text-slate-600">Create monthly maintenance and custom bills with PDF-ready records.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Manage managers</h2>
              <p className="mt-3 text-sm text-slate-600">Invite and soft delete managers while preserving full history.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
