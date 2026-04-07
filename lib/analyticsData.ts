import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface ComplaintStats {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  complaintsByCategory: Array<{ category: string; count: number }>;
  complaintsByPriority: Array<{ priority: string; count: number }>;
  complaintsByStatus: Array<{ status: string; count: number }>;
}

export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  verifiedPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  paymentTrend: Array<{ month: string; amount: number }>;
  collectionRate: number;
}

export interface ResidentStats {
  totalResidents: number;
  activeResidents: number;
  newThisMonth: number;
  residentsByRole: Array<{ role: string; count: number }>;
}

export interface MaintenanceStats {
  monthlyMaintenanceFee: number;
  totalCollected: number;
  pendingCollection: number;
  collectionPercentage: number;
  defaulters: number;
}

export interface DashboardMetrics {
  complaints: ComplaintStats;
  payments: PaymentStats;
  residents: ResidentStats;
  maintenance: MaintenanceStats;
  lastUpdated: string;
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

export async function getComplaintAnalytics(societyId: string): Promise<ComplaintStats> {
  const supabase = await getSupabaseClient();

  // Get total and status breakdown
  const [
    { data: allComplaints },
    { data: openComplaints },
    { data: resolvedComplaints },
    { data: categoryData },
    { data: priorityData },
    { data: statusData },
  ] = await Promise.all([
    supabase
      .from('complaints')
      .select('id, created_at, status', { count: 'exact' })
      .eq('society_id', societyId),
    supabase
      .from('complaints')
      .select('id', { count: 'exact' })
      .eq('society_id', societyId)
      .eq('status', 'open'),
    supabase
      .from('complaints')
      .select('id, created_at', { count: 'exact' })
      .eq('society_id', societyId)
      .eq('status', 'resolved'),
    supabase
      .from('complaints')
      .select('category')
      .eq('society_id', societyId)
      .order('category'),
    supabase
      .from('complaints')
      .select('priority')
      .eq('society_id', societyId)
      .order('priority'),
    supabase
      .from('complaints')
      .select('status')
      .eq('society_id', societyId)
      .order('status'),
  ]);

  // Calculate average resolution time
  let avgResolutionTime = 0;
  if (resolvedComplaints && resolvedComplaints.length > 0) {
    const now = new Date();
    const avgMs =
      resolvedComplaints.reduce((sum, c) => {
        const created = new Date(c.created_at);
        return sum + (now.getTime() - created.getTime());
      }, 0) / resolvedComplaints.length;
    avgResolutionTime = Math.round(avgMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  // Group data
  const groupByField = (data: any[], field: string) => {
    const grouped: Record<string, number> = {};
    data?.forEach(item => {
      const key = item[field] || 'Unknown';
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([key, count]) => ({ [field]: key, count }));
  };

  return {
    totalComplaints: allComplaints?.length || 0,
    openComplaints: openComplaints?.length || 0,
    resolvedComplaints: resolvedComplaints?.length || 0,
    averageResolutionTime: avgResolutionTime,
    complaintsByCategory: groupByField(categoryData || [], 'category').map(item => ({
      category: item.category,
      count: item.count,
    })) as any,
    complaintsByPriority: groupByField(priorityData || [], 'priority').map(item => ({
      priority: item.priority,
      count: item.count,
    })) as any,
    complaintsByStatus: groupByField(statusData || [], 'status').map(item => ({
      status: item.status,
      count: item.count,
    })) as any,
  };
}

export async function getPaymentAnalytics(societyId: string): Promise<PaymentStats> {
  const supabase = await getSupabaseClient();

  const [{ data: payments }] = await Promise.all([
    supabase
      .from('maintenance_payments')
      .select('amount, status, created_at')
      .eq('society_id', societyId),
  ]);

  const verifiedPayments = payments?.filter(p => p.status === 'verified') || [];
  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const failedPayments = payments?.filter(p => p.status === 'failed') || [];

  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const averagePaymentAmount = payments && payments.length > 0 ? totalRevenue / verifiedPayments.length : 0;

  return {
    totalRevenue,
    pendingAmount,
    verifiedPayments: verifiedPayments.length,
    failedPayments: failedPayments.length,
    averagePaymentAmount: Math.round(averagePaymentAmount),
    paymentTrend: [], // Placeholder for monthly trend
    collectionRate: verifiedPayments.length > 0 ? Math.round((verifiedPayments.length / (payments?.length || 1)) * 100) : 0,
  };
}

export async function getResidentAnalytics(societyId: string): Promise<ResidentStats> {
  const supabase = await getSupabaseClient();

  const [{ data: residents }, { data: newResidents }] = await Promise.all([
    supabase
      .from('users')
      .select('role')
      .eq('society_id', societyId)
      .eq('role', 'resident'),
    supabase
      .from('users')
      .select('id')
      .eq('society_id', societyId)
      .eq('role', 'resident')
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()),
  ]);

  return {
    totalResidents: residents?.length || 0,
    activeResidents: Math.round((residents?.length || 0) * 0.95), // Placeholder
    newThisMonth: newResidents?.length || 0,
    residentsByRole: [
      { role: 'resident', count: residents?.length || 0 },
    ],
  };
}

export async function getMaintenanceAnalytics(societyId: string): Promise<MaintenanceStats> {
  const supabase = await getSupabaseClient();

  const [{ data: payments }] = await Promise.all([
    supabase
      .from('maintenance_payments')
      .select('amount, status')
      .eq('society_id', societyId)
      .eq('status', 'verified'),
  ]);

  const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const monthlyFee = 5000; // Placeholder
  const totalResidents = 100; // Placeholder

  return {
    monthlyMaintenanceFee: monthlyFee,
    totalCollected,
    pendingCollection: (totalResidents * monthlyFee) - totalCollected,
    collectionPercentage: Math.round((totalCollected / (totalResidents * monthlyFee)) * 100),
    defaulters: 5, // Placeholder
  };
}

export async function getFullDashboardMetrics(societyId: string): Promise<DashboardMetrics> {
  const [complaints, payments, residents, maintenance] = await Promise.all([
    getComplaintAnalytics(societyId),
    getPaymentAnalytics(societyId),
    getResidentAnalytics(societyId),
    getMaintenanceAnalytics(societyId),
  ]);

  return {
    complaints,
    payments,
    residents,
    maintenance,
    lastUpdated: new Date().toISOString(),
  };
}
