import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoginList from "@/components/login/list";
import { APP_PATHS } from "@/lib/auth/dashboard";
import { getSessionUser } from "@/server/auth/session";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect(APP_PATHS.home);
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-zinc-500">Loading sign in...</p>
        </div>
      }
    >
      <LoginList />
    </Suspense>
  );
}
