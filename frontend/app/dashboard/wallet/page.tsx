import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { WalletCard } from '@/components/WalletCard';
import { getUserWallet, getWalletTransactions, getPaymentStatistics } from '@/lib/walletData';

export default async function WalletPage() {
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

  // Redirect non-residents to appropriate page
  if (userProfile.role !== 'resident') {
    redirect('/dashboard/wallet/admin');
  }

  // Get wallet data
  const wallet = await getUserWallet(user.id);
  const transactions = wallet ? await getWalletTransactions(wallet.id, 10) : [];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const typeColors: Record<string, string> = {
    payment: 'text-blue-600',
    refund: 'text-green-600',
    adjustment: 'text-purple-600',
    reward: 'text-orange-600',
  };

  const typeIcons: Record<string, string> = {
    payment: '💳',
    refund: '↩️',
    adjustment: '⚙️',
    reward: '🎁',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and view payment history</p>
      </div>

      {/* Wallet Card */}
      <WalletCard wallet={wallet} role={userProfile.role} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{transactions
                  .filter(t => t.type === 'payment' && t.status === 'verified')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{transactions
                  .filter(t => t.status === 'pending')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{transactions.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <Link
            href="/dashboard/wallet/transactions"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-lg">{typeIcons[transaction.type] || '📝'}</span>
                      <span className="ml-2 capitalize font-medium text-gray-900">{transaction.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{transaction.description}</td>
                    <td className={`px-6 py-4 font-medium ${typeColors[transaction.type]}`}>
                      {transaction.type === 'refund' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[transaction.status]}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
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
            <p className="text-gray-600 font-medium">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        href="/dashboard/wallet/pay"
        className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-center hover:bg-blue-700 transition"
      >
        Make a Payment
      </Link>
    </div>
  );
}
