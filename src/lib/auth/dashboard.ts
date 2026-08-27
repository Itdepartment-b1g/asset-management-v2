export const APP_PATHS = {
  asset_requests: "/asset-requests",
  home: "/",
  inventory: "/inventory",
  categories: "/categories",
  settings: "/settings",
  users: "/users",
  login: "/login",
} as const;

export const ROLE_DASHBOARD_PATHS = {
  super_admin: APP_PATHS.asset_requests,
  admin: APP_PATHS.asset_requests,
  asset_manager: APP_PATHS.asset_requests,
  employee: APP_PATHS.asset_requests,
  department_head: APP_PATHS.asset_requests,
  head_operations: APP_PATHS.asset_requests,
  operations_manager: APP_PATHS.asset_requests,
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
    role === "employee" ||
    role === "department_head" ||
    role === "head_operations" ||
    role === "operations_manager"
  ) {
    return role;
  }

  return "employee";
}

export function get_dashboard_path(_role?: string | null) {
  return APP_PATHS.asset_requests;
}
