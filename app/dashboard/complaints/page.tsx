import { createServerClient, serialize } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ComplaintForm from '@/components/ComplaintForm';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  raised_by: string;
  created_at: string;
  users?: { full_name: string; role: string };
}

export default async function ComplaintsPage() {
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

  // Get complaints based on user role
  let query = supabase
    .from('complaints')
    .select('*, users!raised_by(full_name, role)')
    .order('created_at', { ascending: false });

  if (userProfile.role === 'resident') {
    query = query.eq('raised_by', user.id);
  } else if (userProfile.role === 'manager') {
    query = query.eq('society_id', userProfile.society_id);
  } else if (userProfile.role === 'admin' || userProfile.role === 'sub_admin') {
    query = query.eq('society_id', userProfile.society_id);
  }

  const { data: complaints } = await query;

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-gray-100 text-gray-800',
    closed: 'bg-gray-500 text-white',
  };

  const categoryEmoji: Record<string, string> = {
    maintenance: '🔧',
    noise: '🔊',
    water: '💧',
    electricity: '⚡',
    garbage: '🗑️',
    security: '🔒',
    other: '📝',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
        <p className="text-gray-600 mt-2">Track and manage society complaints</p>
      </div>

      {/* File Complaint Section - Only for Residents and Manager */}
      {(userProfile.role === 'resident' || userProfile.role === 'manager') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ComplaintForm societyId={userProfile.society_id} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-900">
                {complaints?.filter(c => c.status === 'open').length || 0}
              </div>
              <p className="text-blue-700 font-medium">Open Complaints</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-900">
                {complaints?.filter(c => c.status === 'resolved').length || 0}
              </div>
              <p className="text-green-700 font-medium">Resolved</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-900">
                {complaints?.length || 0}
              </div>
              <p className="text-purple-700 font-medium">Total Complaints</p>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {userProfile.role === 'resident' ? 'My Complaints' : 'Complaints List'}
          </h2>
        </div>

        {complaints && complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complaints.map((complaint: Complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{complaint.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {complaint.users?.full_name || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg">{categoryEmoji[complaint.category as keyof typeof categoryEmoji] || '📝'}</span>
                      <span className="ml-2 capitalize text-sm text-gray-700">{complaint.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{complaint.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium">No complaints found</p>
            {userProfile.role === 'resident' && (
              <p className="text-gray-500 text-sm mt-1">File your first complaint using the form above</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
