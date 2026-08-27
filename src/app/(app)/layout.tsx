import DashboardLayout from "@/app/layout/dashboard-layout";
import { require_app_user } from "@/server/auth/dashboard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await require_app_user();

  return (
    <DashboardLayout
      role={user.role}
      user_name={user.full_name}
      user_email={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
