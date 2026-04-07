import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { getFullDashboardMetrics } from '@/lib/analyticsData';

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name);
          } catch (e) {}
        },
      },
    }
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) redirect('/login');

  // Check if user has permission to view reports (Admin, Sub-admin, Manager)
  if (!['admin', 'sub_admin', 'manager'].includes(userProfile.role)) {
    redirect('/dashboard');
  }

  // Get society info
  const { data: society } = await supabase
    .from('societies')
    .select('name')
    .eq('id', userProfile.society_id)
    .single();

  // Get metrics
  const metrics = await getFullDashboardMetrics(userProfile.society_id);

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Path */}
      <div className="text-sm text-gray-600">
        <span className="hover:text-gray-900">Dashboard</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Reports</span>
      </div>

      {/* Main Dashboard Component */}
      <AnalyticsDashboard
        metrics={metrics}
        societyName={society?.name || 'Society'}
      />

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-bold text-blue-900 mb-2">📊 About These Reports</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Data is updated in real-time from your database</li>
          <li>Reports can be exported as PDF for record-keeping</li>
          <li>Use these insights to make better society management decisions</li>
          <li>All data is calculated based on verified transactions</li>
          <li>Reports are only visible to Admin, Sub-admin, and Managers</li>
        </ul>
      </div>
    </div>
  );
}
