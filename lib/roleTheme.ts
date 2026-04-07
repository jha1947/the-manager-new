export const roleThemes = {
  platform_owner: {
    name: "Platform Owner",
    primary: "owner-900",
    secondary: "owner-700",
    accent: "owner-accent"
  },
  admin: {
    name: "Admin",
    primary: "admin-900",
    secondary: "admin-700",
    accent: "admin-500"
  },
  sub_admin: {
    name: "Sub Admin",
    primary: "subadmin-900",
    secondary: "subadmin-700",
    accent: "subadmin-500"
  },
  manager: {
    name: "Manager",
    primary: "manager-900",
    secondary: "manager-700",
    accent: "manager-500"
  },
  resident: {
    name: "Resident",
    primary: "resident-900",
    secondary: "resident-700",
    accent: "resident-500"
  }
};

export type RoleKey = keyof typeof roleThemes;
