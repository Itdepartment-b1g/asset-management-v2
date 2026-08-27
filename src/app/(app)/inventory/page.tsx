import InventoryList from "@/components/inventory/list";
import { require_app_roles } from "@/server/auth/dashboard";

export default async function InventoryPage() {
  await require_app_roles(["super_admin", "admin", "asset_manager"]);
  return <InventoryList />;
}
