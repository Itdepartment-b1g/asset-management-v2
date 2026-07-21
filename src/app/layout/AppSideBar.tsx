"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/common/logout-button";
import type { DashboardRole } from "@/lib/auth/dashboard";
import {
  format_role_label,
  get_side_bar_menu_items,
} from "@/app/layout/sideBarMenuItems";
import { ChevronRightIcon, InventoryIcon } from "@/app/layout/sidebar-icons";

type AppSideBarProps = {
  role: DashboardRole;
  user_name?: string | null;
  user_email?: string | null;
};

function is_active_path(pathname: string, href: string) {
  if (href === "/super-admin" || href === "/admin" || href === "/employee") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandLogo() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600">
      <InventoryIcon className="h-5 w-5 text-white" />
    </div>
  );
}

export default function AppSideBar({
  role,
  user_name,
  user_email,
}: AppSideBarProps) {
  const pathname = usePathname();
  const menu_items = get_side_bar_menu_items(role);

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-zinc-900">
              Asset Management
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
              {format_role_label(role)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
        {/* <p className="mb-3 px-2 text-xs font-medium text-zinc-400">Menu</p> */}
        <div className="flex flex-col gap-1">
          {menu_items.map((item) => {
            const active = is_active_path(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-700 hover:bg-white/70 hover:text-zinc-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-violet-600" : "text-zinc-500"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.showChevron ? (
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-zinc-200 px-5 py-5">
        {user_name ? (
          <p className="truncate text-sm font-semibold text-zinc-900">
            {user_name}
          </p>
        ) : null}
        {user_email ? (
          <p className="mt-0.5 truncate text-xs text-violet-500">{user_email}</p>
        ) : null}
        <div className="mt-4">
          <LogoutButton variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
