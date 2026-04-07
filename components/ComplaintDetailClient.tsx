'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Manager {
  id: string;
  full_name: string;
  email: string;
}

interface ComplaintDetailClientProps {
  complaintId: string;
  currentStatus: string;
  currentAssignedTo: string | null;
  availableManagers: Manager[];
  userRole: string;
}

export default function ComplaintDetailClient({
  complaintId,
  currentStatus,
  currentAssignedTo,
  availableManagers,
  userRole,
}: ComplaintDetailClientProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [status, setStatus] = useState(currentStatus);
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo || '');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaintId);

      if (error) throw error;

      setStatus(newStatus);
      setMessage({ type: 'success', text: 'Status updated successfully' });
      router.refresh();

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update status',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignment = async (managerId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ assigned_to: managerId })
        .eq('id', complaintId);

      if (error) throw error;

      setAssignedTo(managerId);
      setMessage({ type: 'success', text: 'Complaint assigned successfully' });
      router.refresh();

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to assign complaint',
      });
    } finally {
      setUpdating(false);
    }
  };

  const statuses = ['open', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="font-bold text-gray-900 text-lg">Manage Complaint</h3>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Status Management */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Update Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updating}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment - Only for Admins/Sub-admins/Managers */}
      {(userRole === 'admin' || userRole === 'sub_admin' || userRole === 'manager') && (
        <div>
          <label htmlFor="assign" className="block text-sm font-medium text-gray-700 mb-3">
            Assign to Manager
          </label>
          <select
            id="assign"
            value={assignedTo}
            onChange={e => handleAssignment(e.target.value)}
            disabled={updating}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          >
            <option value="">Select a manager</option>
            {availableManagers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">Note:</span> Changes will be automatically saved and reflected across the system.
        </p>
      </div>
    </div>
  );
}
