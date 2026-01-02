"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  BadgeCheck,
  Users,
  Settings,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Businesses", href: "/admin/businesses", icon: Briefcase },
  { label: "KYC Requests", href: "/admin/kyc", icon: BadgeCheck },
  { label: "Pending Contracts", href: "/admin/contracts", icon: BadgeCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r min-h-screen">
      <div className="w-full p-4 space-y-6">
        <div className="text-xl font-bold text-indigo-600">
          QlutchGrid Admin
        </div>

        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
