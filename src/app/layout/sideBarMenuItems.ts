import type { ComponentType } from "react";
import { LayoutDashboard, Package, Settings, Tags, Users } from "lucide-react";
import type { DashboardRole } from "@/lib/auth/dashboard";

export type SideBarMenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  showChevron?: boolean;
};

export const employee_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
];

export const super_admin_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  {
    label: "Inventory",
    href: "/super-admin/inventory",
    icon: Package,
    showChevron: false,
  },
  {
    label: "Users",
    href: "/super-admin/users",
    icon: Users,
    showChevron: false,
  },
  {
    label: "Categories",
    href: "/super-admin/categories",
    icon: Tags,
    showChevron: false,
  },
  {
    label: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    showChevron: false,
  },
];

export const admin_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Package,
    showChevron: false,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
    showChevron: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    showChevron: true,
  },
];

const menu_items_by_role = {
  super_admin: super_admin_menu_items,
  admin: admin_menu_items,
  employee: employee_menu_items,
} satisfies Record<DashboardRole, SideBarMenuItem[]>;

export function get_side_bar_menu_items(role: DashboardRole) {
  return menu_items_by_role[role];
}

export function format_role_label(role: DashboardRole) {
  return role.replace("_", " ").toUpperCase();
}
