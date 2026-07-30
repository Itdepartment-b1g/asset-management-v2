"use client";

import { useRouter } from "next/navigation";
import { LogoutIcon } from "@/app/layout/sidebar-icons";
import { createClient } from "@/lib/supabase/client";
import { clearAuthUser } from "@/lib/store/slices/auth-slices";
import { useAppDispatch } from "@/lib/store/hooks";

type LogoutButtonProps = {
  variant?: "default" | "sidebar";
};

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    dispatch(clearAuthUser());
    router.push("/login");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
      >
        <LogoutIcon className="h-5 w-5" />
        Logout
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-zinc-600 underline hover:text-zinc-900"
    >
      Sign out
    </button>
  );
}
