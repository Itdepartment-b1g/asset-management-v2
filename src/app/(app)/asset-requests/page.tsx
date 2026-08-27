import { require_app_roles } from "@/server/auth/dashboard";

export default async function AssetRequestsPage() {

  await require_app_roles(["super_admin", "admin", "head_operations", "operations_manager","department_head"]);
  return <div>AssetRequestsPage</div>;
}