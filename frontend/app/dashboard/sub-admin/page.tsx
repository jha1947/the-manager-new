export default function SubAdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sub admin view</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Verification and approvals</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Payment verification</h2>
              <p className="mt-3 text-sm text-slate-600">Review proofs, verify payments and credit resident wallets.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Expense approvals</h2>
              <p className="mt-3 text-sm text-slate-600">Approve or reject common and wing expenses with reason tracking.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
