export type ManagedUserRole = "admin" | "employee";

export const managed_user_role_options = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employee" },
] as const;

export function is_managed_user_role(
  role: string | null | undefined,
): role is ManagedUserRole {
  return role === "admin" || role === "employee";
}
