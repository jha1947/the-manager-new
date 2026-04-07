import Link from "next/link";
import { RoleKey, roleThemes } from "@/lib/roleTheme";

type SidebarProps = {
  role: RoleKey;
  activePage?: string;
};

const sidebarColors: Record<RoleKey, string> = {
  platform_owner: "bg-[#1A1A2E]",
  admin: "bg-[#0A1F44]",
  sub_admin: "bg-[#0F6E56]",
  manager: "bg-[#854F0B]",
  resident: "bg-[#3730A3]"
};

const activeLinkColors: Record<RoleKey, string> = {
  platform_owner: "bg-[#16213E] text-white",
  admin: "bg-[#1A3A6B] text-white",
  sub_admin: "bg-[#1D9E75] text-white",
  manager: "bg-[#BA7517] text-white",
  resident: "bg-[#4338CA] text-white"
};

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/reports" },
  { label: "Haat Bazaar", href: "/dashboard/haat-bazaar" },
  { label: "Profile", href: "/dashboard/profile" }
];

export function Sidebar({ role, activePage = "/dashboard" }: SidebarProps) {
  const theme = roleThemes[role];

  return (
    <aside className={`min-h-screen w-72 shrink-0 px-6 py-8 text-white ${sidebarColors[role]}`}>
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{theme.name}</p>
        <h2 className="mt-4 text-3xl font-semibold">The Manager</h2>
      </div>

      <nav className="space-y-3">
        {navLinks.map((link) => {
          const isActive = activePage === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? activeLinkColors[role] : "text-slate-200 hover:bg-white/10 hover:text-white"}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-4 text-slate-100">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Quick actions</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="rounded-2xl bg-white/10 px-4 py-3">Generate bill</li>
          <li className="rounded-2xl bg-white/10 px-4 py-3">New complaint</li>
          <li className="rounded-2xl bg-white/10 px-4 py-3">Wallet summary</li>
        </ul>
      </div>
    </aside>
  );
}
