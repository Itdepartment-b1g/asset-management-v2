import DashboardList from "@/components/dashboard/list";
import { require_app_user } from "@/server/auth/dashboard";

export default async function HomePage() {
  await require_app_user();
  return <DashboardList />;
}
