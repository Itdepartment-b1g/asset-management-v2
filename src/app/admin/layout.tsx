import DashboardLayout from "@/app/layout/dashboard-layout";
import { require_dashboard_role } from "@/server/auth/dashboard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await require_dashboard_role("admin");

  return (
    <DashboardLayout
      role="admin"
      user_name={user.full_name}
      user_email={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
