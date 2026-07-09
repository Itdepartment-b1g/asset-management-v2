import "server-only";

import { redirect } from "next/navigation";
import {
  get_dashboard_path,
  type DashboardRole,
} from "@/lib/auth/dashboard";
import { getSessionUser } from "@/server/auth/session";

// Require a signed-in user with a specific dashboard role.
// Wrong role -> redirect to that user's own dashboard.
// Not signed in -> redirect to /login.
export async function require_dashboard_role(required_role: DashboardRole) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== required_role) {
    redirect(get_dashboard_path(user.role));
  }

  return user;
}
