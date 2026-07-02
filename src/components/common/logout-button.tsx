"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearAuthUser } from "@/lib/store/auth";
import { useAppDispatch } from "@/lib/store/hooks";

export function LogoutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    dispatch(clearAuthUser());
    router.push("/login");
    router.refresh();
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
