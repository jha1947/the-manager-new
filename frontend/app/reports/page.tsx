import { redirect } from 'next/navigation';

export default function ReportsPage() {
  // Redirect to the new analytics dashboard
  redirect('/dashboard/reports');
}
