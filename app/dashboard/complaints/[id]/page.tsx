import { createServerClient, serialize } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ComplaintDetailClient from '@/components/ComplaintDetailClient';

export default async function ComplaintDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Get complaint
  const { data: complaint } = await supabase
    .from('complaints')
    .select(`
      *,
      users!raised_by(full_name, email),
      assigned_to_user:assigned_to(full_name, email)
    `)
    .eq('id', params.id)
    .single();

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Complaint not found</h1>
        <p className="text-gray-600 mt-2">The complaint you're looking for doesn't exist.</p>
        <Link href="/dashboard/complaints" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Complaints
        </Link>
      </div>
    );
  }

  // Check permissions
  const canEdit = 
    user.id === complaint.raised_by ||
    userProfile.role === 'admin' ||
    userProfile.role === 'sub_admin' ||
    userProfile.role === 'manager';

  const canAssign = 
    userProfile.role === 'admin' ||
    userProfile.role === 'sub_admin' ||
    userProfile.role === 'manager';

  // Get available managers for assignment
  interface Manager {
    id: string;
    full_name: string;
    email: string;
  }
  
  let availableManagers: Manager[] = [];
  if (canAssign) {
    const { data: managers } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('society_id', userProfile.society_id)
      .eq('role', 'manager');
    availableManagers = (managers as Manager[]) || [];
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/complaints" className="text-blue-600 hover:underline">
          ← Back to Complaints
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{complaint.title}</h1>
                <p className="text-gray-500 text-sm mt-1">ID: {complaint.id}</p>
              </div>
              <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Category</p>
                <p className="text-gray-900 mt-1 capitalize">{complaint.category}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Priority</p>
                <p className={`mt-1 px-2 py-1 rounded text-xs font-semibold inline-block ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                  {complaint.priority.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Location</p>
                <p className="text-gray-900 mt-1">{complaint.location}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Date Filed</p>
                <p className="text-gray-900 mt-1">{new Date(complaint.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Attachment */}
          {complaint.attachment_url && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Attachment</h2>
              <a
                href={complaint.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900">View Attachment</p>
                    <p className="text-sm text-blue-700">Click to open</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}

          {/* Resident Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Complaint Filed By</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {complaint.users?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{complaint.users?.full_name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{complaint.users?.email || 'No email'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Section - Only for Admins/Sub-admins/Managers */}
          {canAssign && (
            <ComplaintDetailClient
              complaintId={complaint.id}
              currentStatus={complaint.status}
              currentAssignedTo={complaint.assigned_to}
              availableManagers={availableManagers}
              userRole={userProfile.role}
            />
          )}

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
            <h3 className="font-bold text-purple-900 mb-4">Complaint Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Status</span>
                <span className="font-semibold text-purple-900">{complaint.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Priority</span>
                <span className="font-semibold text-purple-900 uppercase">{complaint.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Category</span>
                <span className="font-semibold text-purple-900 capitalize">{complaint.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Assigned To</span>
                <span className="font-semibold text-purple-900">
                  {complaint.assigned_to_user?.full_name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
