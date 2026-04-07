export type Role = "platform_owner" | "admin" | "sub_admin" | "manager" | "resident";

export type SocietyRole = {
  id: string;
  name: string;
  role: Role;
  societyId?: string;
  wingId?: string;
  floorId?: string;
  flatId?: string;
};

export type DashboardCard = {
  title: string;
  value: string;
  description: string;
};
