import type { ComponentType } from "react";
import type { DashboardRole } from "@/lib/auth/dashboard";
import {
  CategoriesIcon,
  DashboardIcon,
  InventoryIcon,
  SettingsIcon,
} from "@/app/layout/sidebar-icons";

export type SideBarMenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  showChevron?: boolean;
};

export const employee_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/employee", icon: DashboardIcon },
];

export const super_admin_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: DashboardIcon },
  {
    label: "Inventory",
    href: "/super-admin/inventory",
    icon: InventoryIcon,
    showChevron: true,
  },
  {
    label: "Categories",
    href: "/super-admin/categories",
    icon: CategoriesIcon,
    showChevron: true,
  },
  {
    label: "Settings",
    href: "/super-admin/settings",
    icon: SettingsIcon,
    showChevron: true,
  },
];

export const admin_menu_items: SideBarMenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: InventoryIcon,
    showChevron: true,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: CategoriesIcon,
    showChevron: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: SettingsIcon,
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
