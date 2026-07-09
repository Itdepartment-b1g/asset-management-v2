import DashboardLayout from "@/app/layout/dashboard-layout";
import { require_dashboard_role } from "@/server/auth/dashboard";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await require_dashboard_role("employee");

  return (
    <DashboardLayout
      role="employee"
      user_name={user.full_name}
      user_email={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
