import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'payment' | 'refund' | 'adjustment' | 'reward';
  amount: number;
  description: string;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
  reference_id?: string;
}

export interface MaintenanceBill {
  id: string;
  society_id: string;
  month: string;
  year: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function getUserWallet(userId: string): Promise<Wallet | null> {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}

export async function getWalletTransactions(walletId: string, limit: number = 50) {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getResidentMaintenanceBills(
  userId: string,
  societyId: string
) {
  const supabase = await getSupabaseClient();

  // Get maintenance bills for the month
  const { data } = await supabase
    .from('maintenance_payments')
    .select(
      `
      id,
      amount,
      status,
      created_at,
      reference_id
    `
    )
    .eq('resident_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getPendingPayments(societyId: string) {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('maintenance_payments')
    .select(
      `
      id,
      amount,
      status,
      created_at,
      resident_id,
      users!resident_id(full_name, email),
      maintenance_bills(month, year)
    `
    )
    .eq('society_id', societyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getVerifiedPayments(societyId: string, limit: number = 100) {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('maintenance_payments')
    .select(
      `
      id,
      amount,
      status,
      created_at,
      verified_at,
      resident_id,
      users!resident_id(full_name, email),
      maintenance_bills(month, year)
    `
    )
    .eq('society_id', societyId)
    .eq('status', 'verified')
    .order('verified_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getPaymentStatistics(societyId: string) {
  const supabase = await getSupabaseClient();

  const [{ data: pendingPayments }, { data: verifiedPayments }, { data: failedPayments }] =
    await Promise.all([
      supabase
        .from('maintenance_payments')
        .select('amount', { count: 'exact' })
        .eq('society_id', societyId)
        .eq('status', 'pending'),
      supabase
        .from('maintenance_payments')
        .select('amount', { count: 'exact' })
        .eq('society_id', societyId)
        .eq('status', 'verified'),
      supabase
        .from('maintenance_payments')
        .select('amount', { count: 'exact' })
        .eq('society_id', societyId)
        .eq('status', 'failed'),
    ]);

  const totalPending = pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalVerified = verifiedPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalFailed = failedPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return {
    pendingCount: pendingPayments?.length || 0,
    verifiedCount: verifiedPayments?.length || 0,
    failedCount: failedPayments?.length || 0,
    pendingAmount: totalPending,
    verifiedAmount: totalVerified,
    failedAmount: totalFailed,
  };
}
