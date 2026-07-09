import DashboardLayout from "@/app/layout/dashboard-layout";
import { require_dashboard_role } from "@/server/auth/dashboard";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await require_dashboard_role("super_admin");

  return (
    <DashboardLayout
      role="super_admin"
      user_name={user.full_name}
      user_email={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
