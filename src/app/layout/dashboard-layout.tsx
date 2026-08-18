import AppSideBar from "@/app/layout/AppSideBar";
import type { DashboardRole } from "@/lib/auth/dashboard";

type DashboardLayoutProps = {
  role: DashboardRole;
  user_name?: string | null;
  user_email?: string | null;
  children: React.ReactNode;
};

export default function DashboardLayout({
  role,
  user_name,
  user_email,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AppSideBar
        role={role}
        user_name={user_name}
        user_email={user_email}
      />
      <main className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
