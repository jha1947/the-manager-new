export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Income, expenses, assets and maintenance</h1>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Income report</h2>
              <p className="mt-3 text-sm text-slate-600">Month and year wise income entries with verification status.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Expense report</h2>
              <p className="mt-3 text-sm text-slate-600">Common and wing expense approvals, rejection reasons, and totals.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Outstanding maintenance</h2>
              <p className="mt-3 text-sm text-slate-600">Resident dues, pending months, and society billing summary.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
