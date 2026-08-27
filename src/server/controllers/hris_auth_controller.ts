import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { create_admin_client } from "@/lib/supabase/admin";
import {
  build_full_name,
  HrisSsoError,
  verify_hris_token,
} from "@/server/lib/hris-sso";
import { auth_repository } from "@/server/repositories/auth_repository";
import { APP_PATHS } from "@/lib/auth/dashboard";

async function find_supabase_user_id_by_email(email: string) {
  const admin = create_admin_client();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new HrisSsoError(error.message);
    }

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (found) {
      return found.id;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensure_supabase_auth_user(
  email: string,
  full_name: string,
  employee_code: string,
) {
  const admin = create_admin_client();
  const existing_id = await find_supabase_user_id_by_email(email);

  if (existing_id) {
    return existing_id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name,
      employee_code,
    },
  });

  if (error) {
    const duplicate =
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered");

    if (duplicate) {
      const fallback_id = await find_supabase_user_id_by_email(email);

      if (fallback_id) {
        return fallback_id;
      }
    }

    throw new HrisSsoError(error.message);
  }

  if (!data.user) {
    throw new HrisSsoError("Failed to create auth user");
  }

  return data.user.id;
}

async function establish_supabase_session(email: string) {
  const admin = create_admin_client();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data.properties?.hashed_token) {
    throw new HrisSsoError(error?.message ?? "Failed to create auth session");
  }

  const supabase = await createClient();
  const { error: verify_error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: data.properties.hashed_token,
  });

  if (verify_error) {
    throw new HrisSsoError(verify_error.message);
  }
}

function redirect_after_sso(request: Request) {
  return NextResponse.redirect(new URL(APP_PATHS.home, request.url));
}

export const hris_auth_controller = {
  async handle_callback(request: Request) {
    const token = new URL(request.url).searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    try {
      const payload = await verify_hris_token(token);
      const full_name = build_full_name(payload);
      const email = payload.company_email;

      const supabase_user_id = await ensure_supabase_auth_user(
        email,
        full_name,
        payload.employee_code,
      );

      await auth_repository.upsert_from_hris({
        supabase_user_id,
        hris_employee_id: payload.hris_employee_id,
        employee_code: payload.employee_code,
        email,
        full_name,
        is_active: payload.is_active,
      });

      await establish_supabase_session(email);

      return redirect_after_sso(request);
    } catch (error) {
      if (error instanceof HrisSsoError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      console.error(error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
};
