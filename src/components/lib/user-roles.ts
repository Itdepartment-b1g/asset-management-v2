import { get_effective_role } from "@/lib/auth/dashboard";
import { format_role_label, ROLES } from "@/lib/auth/roles";

export const DEFAULT_TEMP_PASSWORD =
  process.env.NEXT_PUBLIC_DEFAULT_TEMP_PASSWORD ?? "";
  
export type ManagedUserRole = "admin" | "asset_manager" | "employee" | "department_head" | "head_operations" | "operations_manager";

export const managed_user_role_options = [
  { value: "admin", label: "Admin" },
  { value: "asset_manager", label: "Asset manager" },
  { value: "employee", label: "Employee" },
  { value: "department_head", label: "Department head" },
  { value: "head_operations", label: "Head operations" },
  { value: "operations_manager", label: "Operations manager" },
] as const;

export function is_managed_user_role(
  role: string | null | undefined,
): role is ManagedUserRole {
  return (
    role === ROLES.admin ||
    role === ROLES.asset_manager ||
    role === ROLES.employee ||
    role === ROLES.department_head ||
    role === ROLES.head_operations ||
    role === ROLES.operations_manager
  );
}

export { get_effective_role };

export function format_user_role(role: string | null | undefined) {
  const label = format_role_label(get_effective_role(role));

  if (!role) {
    return `${label} (default)`;
  }

  return label;
}
