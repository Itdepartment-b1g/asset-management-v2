import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authRepository } from "@/server/repositories/auth_repository";

export type SessionUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await authRepository.findById(user.id);

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    full_name: profile?.full_name ?? null,
  };
}

export async function requireAuthUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user;
}
