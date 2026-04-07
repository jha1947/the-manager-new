'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface PaymentVerificationClientProps {
  paymentId: string;
  residentName: string;
  amount: number;
}

export default function PaymentVerificationClient({
  paymentId,
  residentName,
  amount,
}: PaymentVerificationClientProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = async (actionType: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('maintenance_payments')
        .update({
          status: actionType === 'approve' ? 'verified' : 'failed',
          verified_at: new Date().toISOString(),
          notes: notes || null,
          verified_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', paymentId);

      if (error) throw error;

      // If approved, update resident's wallet balance
      if (actionType === 'approve') {
        // The wallet update would be handled by a database trigger
        // or a separate API call in a production system
      }

      setShowModal(false);
      setNotes('');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setAction('approve');
          setShowModal(true);
        }}
        className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition"
      >
        Verify
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {action === 'approve' ? 'Verify Payment' : 'Reject Payment'}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Resident</p>
              <p className="font-medium text-gray-900 mt-1">{residentName}</p>

              <p className="text-sm text-gray-600 mt-3">Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{amount.toLocaleString()}</p>
            </div>

            {action === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Why is this payment being rejected?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            )}

            {action === 'approve' && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  ✓ This payment will be marked as verified and the resident's wallet will be updated.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(action || 'approve')}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
                disabled={loading || (action === 'reject' && !notes)}
              >
                {loading ? 'Processing...' : action === 'approve' ? 'Verify' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
