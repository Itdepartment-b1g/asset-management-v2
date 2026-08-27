import CategoriesList from "@/components/categories/list";
import { require_app_roles } from "@/server/auth/dashboard";

export default async function CategoriesPage() {
  await require_app_roles(["super_admin", "admin", "asset_manager"]);
  return <CategoriesList />;
}
