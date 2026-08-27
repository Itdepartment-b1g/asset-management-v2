import "server-only";

import { redirect } from "next/navigation";
import {
  APP_PATHS,
  get_effective_role,
  type DashboardRole,
} from "@/lib/auth/dashboard";
import { getSessionUser, type SessionUser } from "@/server/auth/session";

export type AppSessionUser = SessionUser & {
  role: DashboardRole;
};

export async function require_app_user(): Promise<AppSessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(APP_PATHS.login);
  }

  return {
    ...user,
    role: get_effective_role(user.role),
  };
}

export async function require_app_roles(allowed_roles: DashboardRole[]) {
  const user = await require_app_user();

  if (!allowed_roles.includes(user.role)) {
    redirect(APP_PATHS.home);
  }

  return user;
}
