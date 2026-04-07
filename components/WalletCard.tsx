'use client';

import Link from 'next/link';
import { Wallet } from '@/lib/walletData';

interface WalletCardProps {
  wallet: Wallet | null;
  role: string;
}

export function WalletCard({ wallet, role }: WalletCardProps) {
  const roleColors: Record<string, string> = {
    resident: 'from-blue-500 to-purple-600',
    manager: 'from-orange-500 to-red-500',
    admin: 'from-blue-600 to-indigo-700',
    sub_admin: 'from-green-500 to-teal-600',
    platform_owner: 'from-slate-600 to-slate-800',
  };

  const gradient = roleColors[role] || 'from-blue-500 to-purple-600';

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-90 font-medium">Available Balance</p>
          <h3 className="text-4xl font-bold mt-2">
            ₹{(wallet?.balance || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="bg-white/20 rounded-full p-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
      </div>

      <div className="flex gap-3">
        {role === 'resident' && (
          <>
            <Link
              href="/dashboard/wallet/pay"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium text-sm transition"
            >
              Make Payment
            </Link>
            <Link
              href="/dashboard/wallet"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium text-sm transition"
            >
              View Details
            </Link>
          </>
        )}

        {(role === 'admin' || role === 'sub_admin' || role === 'manager') && (
          <Link
            href="/dashboard/wallet/admin"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium text-sm transition"
          >
            Manage Payments
          </Link>
        )}
      </div>

      <p className="text-xs opacity-75 mt-4">
        Last updated: {wallet?.updated_at ? new Date(wallet.updated_at).toLocaleDateString() : 'N/A'}
      </p>
    </div>
  );
}
