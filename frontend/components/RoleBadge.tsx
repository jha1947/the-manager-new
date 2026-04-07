type RoleBadgeProps = {
  role: string;
};

const badgeClass = {
  platform_owner: "bg-owner-accent text-white",
  admin: "bg-admin-500 text-white",
  sub_admin: "bg-subadmin-500 text-white",
  manager: "bg-manager-500 text-white",
  resident: "bg-resident-500 text-white"
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${badgeClass[role as keyof typeof badgeClass] || "bg-slate-300 text-slate-900"}`}>
      {role.replace("_", " ")}
    </span>
  );
}
