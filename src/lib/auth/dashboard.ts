export const ROLE_DASHBOARD_PATHS = {
  super_admin: "/super-admin",
  admin: "/admin",
  employee: "/employee",
} as const;

export type DashboardRole = keyof typeof ROLE_DASHBOARD_PATHS;

export function is_dashboard_role(
  role: string | null | undefined,
): role is DashboardRole {
  return !!role && role in ROLE_DASHBOARD_PATHS;
}

export function get_dashboard_path(role: string | null | undefined) {
  if (is_dashboard_role(role)) {
    return ROLE_DASHBOARD_PATHS[role];
  }

  return "/login";
}
