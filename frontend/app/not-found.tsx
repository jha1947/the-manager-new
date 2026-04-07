import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 text-center">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">404 error</p>
        <h1 className="mt-6 text-4xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist yet. Return to the dashboard or home page.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="button-secondary">Home</Link>
          <Link href="/dashboard" className="button-primary">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
