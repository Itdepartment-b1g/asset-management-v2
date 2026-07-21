import "server-only";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth_repository } from "@/server/repositories/auth_repository";

export type SessionUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

// Resolve the user from an `Authorization: Bearer <token>` header or,
// when absent, from the Supabase session cookie.
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const header_store = await headers();
  const authorization = header_store.get("authorization");
  const bearer_token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  const {
    data: { user },
  } = bearer_token
    ? await supabase.auth.getUser(bearer_token)
    : await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await auth_repository.find_by_id(user.id);

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    full_name: profile?.full_name ?? null,
    role: profile?.role ?? null,
  };
}

export async function requireAuthUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user;
}
