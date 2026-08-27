export const ROLES = {
  super_admin: "super_admin",
  admin: "admin",
  asset_manager: "asset_manager",
  employee: "employee",
  department_head: "department_head",
  head_operations: "head_operations",
  operations_manager: "operations_manager",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ASSET_PRIVILEGED_ROLES = new Set<string>([
  ROLES.super_admin,
  ROLES.admin,
  ROLES.asset_manager,
]);

export const USER_MANAGEMENT_ROLES = new Set<string>([
  ROLES.super_admin,
  ROLES.admin,
]);

export function format_role_label(role: string | null | undefined) {
  if (!role) return "—";
  return role.replaceAll("_", " ");
}
