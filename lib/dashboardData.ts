import { supabase } from "@/lib/supabaseClient";
import type { Role, DashboardCard } from "@/lib/types";

export interface DashboardStats {
  cards: DashboardCard[];
  recentActivity: any[];
  alerts: any[];
}

export async function getDashboardStats(role: Role, societyId?: string): Promise<DashboardStats> {
  if (!supabase || !societyId) {
    return { cards: [], recentActivity: [], alerts: [] };
  }

  const stats: DashboardStats = {
    cards: [],
    recentActivity: [],
    alerts: []
  };

  try {
    switch (role) {
      case "platform_owner":
        stats.cards = await getPlatformOwnerStats();
        break;
      case "admin":
        stats.cards = await getAdminStats(societyId);
        break;
      case "sub_admin":
        stats.cards = await getSubAdminStats(societyId);
        break;
      case "manager":
        stats.cards = await getManagerStats(societyId);
        break;
      case "resident":
        stats.cards = await getResidentStats(societyId);
        break;
    }

    // Get recent activity and alerts for all roles
    stats.recentActivity = await getRecentActivity(role, societyId);
    stats.alerts = await getAlerts(role, societyId);

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }

  return stats;
}

async function getPlatformOwnerStats(): Promise<DashboardCard[]> {
  if (!supabase) return [];
  const { data: societies } = await supabase
    .from("societies")
    .select("id", { count: "exact" });

  if (!supabase) return [];
  const { data: users } = await supabase
    .from("users")
    .select("id", { count: "exact" });

  return [
    { title: "Total Societies", value: societies?.length.toString() || "0", description: "Active societies" },
    { title: "Total Users", value: users?.length.toString() || "0", description: "Registered users" },
    { title: "Pending Verifications", value: "0", description: "Awaiting admin verification" }
  ];
}

async function getAdminStats(societyId: string): Promise<DashboardCard[]> {
  if (!supabase) return [];

  const { data: residents } = await supabase
    .from("users")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("role", "resident");

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "open");

  const { data: payments } = await supabase
    .from("maintenance_payments")
    .select("amount")
    .eq("status", "verified");

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return [
    { title: "Total Residents", value: residents?.length.toString() || "0", description: "In society" },
    { title: "Open Complaints", value: complaints?.length.toString() || "0", description: "Need attention" },
    { title: "Revenue Collected", value: `₹${totalRevenue.toLocaleString()}`, description: "This month" }
  ];
}

async function getSubAdminStats(societyId: string): Promise<DashboardCard[]> {
  if (!supabase) return [];

  const { data: payments } = await supabase
    .from("maintenance_payments")
    .select("id", { count: "exact" })
    .eq("status", "pending");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "pending");

  const { data: reports } = await supabase
    .from("reports")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "pending");

  return [
    { title: "Pending Payments", value: payments?.length.toString() || "0", description: "Awaiting verification" },
    { title: "Pending Expenses", value: expenses?.length.toString() || "0", description: "Need approval" },
    { title: "Pending Reports", value: reports?.length.toString() || "0", description: "Awaiting verification" }
  ];
}

async function getManagerStats(societyId: string): Promise<DashboardCard[]> {
  if (!supabase) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "pending");

  const { data: works } = await supabase
    .from("daily_works")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "pending");

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id", { count: "exact" })
    .eq("society_id", societyId)
    .eq("status", "in_progress");

  return [
    { title: "Pending Tasks", value: tasks?.length.toString() || "0", description: "Assigned to me" },
    { title: "Daily Works", value: works?.length.toString() || "0", description: "Need completion" },
    { title: "Active Complaints", value: complaints?.length.toString() || "0", description: "In progress" }
  ];
}

async function getResidentStats(societyId: string): Promise<DashboardCard[]> {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: payments } = await supabase
    .from("maintenance_payments")
    .select("amount, status")
    .eq("resident_id", user.id);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id", { count: "exact" })
    .eq("raised_by", user.id)
    .eq("status", "open");

  const balance = wallet?.balance || 0;
  const paidAmount = payments?.filter(p => p.status === "verified").reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return [
    { title: "Wallet Balance", value: `₹${balance.toLocaleString()}`, description: "Available points" },
    { title: "Paid This Month", value: `₹${paidAmount.toLocaleString()}`, description: "Maintenance paid" },
    { title: "Open Complaints", value: complaints?.length.toString() || "0", description: "Awaiting resolution" }
  ];
}

async function getRecentActivity(role: Role, societyId: string): Promise<any[]> {
  // This would fetch recent activity based on role
  // For now, return empty array
  return [];
}

async function getAlerts(role: Role, societyId: string): Promise<any[]> {
  // This would fetch alerts based on role
  // For now, return empty array
  return [];
}
