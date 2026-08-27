import type { ComponentType } from "react";
import { LayoutDashboard, Package, Settings, Tags, Users } from "lucide-react";
import { APP_PATHS, type DashboardRole } from "@/lib/auth/dashboard";

export type SideBarMenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  showChevron?: boolean;
};

const home_item: SideBarMenuItem = {
  label: "Dashboard",
  href: APP_PATHS.home,
  icon: LayoutDashboard,
};

const inventory_item: SideBarMenuItem = {
  label: "Inventory",
  href: APP_PATHS.inventory,
  icon: Package,
  showChevron: false,
};

const users_item: SideBarMenuItem = {
  label: "Users",
  href: APP_PATHS.users,
  icon: Users,
  showChevron: false,
};

const categories_item: SideBarMenuItem = {
  label: "Categories",
  href: APP_PATHS.categories,
  icon: Tags,
  showChevron: false,
};

const settings_item: SideBarMenuItem = {
  label: "Settings",
  href: APP_PATHS.settings,
  icon: Settings,
  showChevron: false,
};

export const employee_menu_items: SideBarMenuItem[] = [home_item];

export const super_admin_menu_items: SideBarMenuItem[] = [
  home_item,
  inventory_item,
  users_item,
  categories_item,
  settings_item,
];

export const admin_menu_items: SideBarMenuItem[] = [
  home_item,
  inventory_item,
  categories_item,
  settings_item,
];

export const asset_manager_menu_items: SideBarMenuItem[] = [
  home_item,
  inventory_item,
  categories_item,
  settings_item,
];

const menu_items_by_role = {
  super_admin: super_admin_menu_items,
  admin: admin_menu_items,
  asset_manager: asset_manager_menu_items,
  employee: employee_menu_items,
} satisfies Record<DashboardRole, SideBarMenuItem[]>;

export function get_side_bar_menu_items(role: DashboardRole) {
  return menu_items_by_role[role];
}

export function format_role_label(role: DashboardRole) {
  return role.replaceAll("_", " ").toUpperCase();
}
