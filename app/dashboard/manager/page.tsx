export default function ManagerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Manager panel</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Daily work & complaint flow</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Work log</h2>
              <p className="mt-3 text-sm text-slate-600">Start and complete daily jobs with proof images and voice notes.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Complaint tracking</h2>
              <p className="mt-3 text-sm text-slate-600">Accept complaints, update statuses and maintain verification history.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
