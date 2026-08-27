export const APP_PATHS = {
  home: "/",
  inventory: "/inventory",
  categories: "/categories",
  settings: "/settings",
  users: "/users",
  login: "/login",
} as const;

export const ROLE_DASHBOARD_PATHS = {
  super_admin: APP_PATHS.home,
  admin: APP_PATHS.home,
  asset_manager: APP_PATHS.home,
  employee: APP_PATHS.home,
} as const;

export type DashboardRole = keyof typeof ROLE_DASHBOARD_PATHS;

export function is_dashboard_role(
  role: string | null | undefined,
): role is DashboardRole {
  return !!role && role in ROLE_DASHBOARD_PATHS;
}

export function get_effective_role(role: string | null | undefined): DashboardRole {
  if (
    role === "super_admin" ||
    role === "admin" ||
    role === "asset_manager" ||
    role === "employee"
  ) {
    return role;
  }

  return "employee";
}

export function get_dashboard_path(_role?: string | null) {
  return APP_PATHS.home;
}
