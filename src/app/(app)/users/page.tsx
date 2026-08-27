import UsersList from "@/components/users/list";
import { require_app_roles } from "@/server/auth/dashboard";

export default async function UsersPage() {
  await require_app_roles(["super_admin"]);
  return <UsersList />;
}
