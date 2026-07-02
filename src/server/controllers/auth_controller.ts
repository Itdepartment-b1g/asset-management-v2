import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authRepository } from "@/server/repositories/auth_repository";

type SignupBody = { email?: string; password?: string; full_name?: string };
type LoginBody = { email?: string; password?: string };

function toUserResponse(user: {
  id: string;
  email: string | null;
  full_name: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  };
}

export const authController = {
  async signup(body: SignupBody) {
    const email = body.email?.trim();
    const password = body.password;
    const full_name = body.full_name?.trim() || null;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 400 },
      );
    }

    const profile = await authRepository.upsertFromAuth({
      id: data.user.id,
      email,
      full_name,
    });

    return NextResponse.json(toUserResponse(profile), { status: 201 });
  },

  async login(body: LoginBody) {
    const email = body.email?.trim();
    const password = body.password;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "password is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const profile = await authRepository.upsertFromAuth({
      id: data.user.id,
      email: data.user.email,
    });

    return NextResponse.json(toUserResponse(profile));
  },
};
