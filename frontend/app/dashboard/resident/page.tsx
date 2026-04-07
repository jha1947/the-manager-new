export default function ResidentDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Resident space</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Payments, complaints and wallet</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Maintenance bills</h2>
              <p className="mt-3 text-sm text-slate-600">View monthly dues, upload payment proof and track verification status.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Complaints</h2>
              <p className="mt-3 text-sm text-slate-600">Raise complaints with images, voice, or PDF attachments and monitor progress.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
