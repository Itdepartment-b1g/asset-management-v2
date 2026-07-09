import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { create_admin_client } from "@/lib/supabase/admin";
import {
  UserCreationForbiddenError,
  UserNotFoundError,
  UserUpdateForbiddenError,
  ValidationError,
  auth_repository,
} from "@/server/repositories/auth_repository";
import { requireAuthUser } from "@/server/auth/session";

type LoginBody = { email?: string; password?: string };

type CreateUserBody = {
  email?: string;
  password?: string;
  full_name?: string | null;
  role?: string | null;
};

type UpdateUserBody = {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  password?: string;
};

// Shape a Prisma user row into the JSON returned by auth API routes.
function to_user_response(user: {
  id: string;
  email: string | null;
  full_name: string | null;
  role?: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role ?? null,
  };
}

// Map repository errors to HTTP responses:
// - not found -> 404
// - forbidden create/update rules -> 403
// - validation errors -> 400
// - unexpected errors -> 500
function handle_repository_error(error: unknown) {
  if (error instanceof UserNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (
    error instanceof UserCreationForbiddenError ||
    error instanceof UserUpdateForbiddenError
  ) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export const auth_controller = {
  // Sign in with email/password via Supabase Auth, then sync the matching profile.
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

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      if (!data.user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      const profile = await auth_repository.sync_profile_on_login({
        id: data.user.id,
        email: data.user.email,
      });

      return NextResponse.json(to_user_response(profile));
    } catch (error) {
      return handle_repository_error(error);
    }
  },

  // Create a Supabase auth user and matching profile (super_admin/admin only).
  async create_user(body: CreateUserBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const email = body.email?.trim();
    const password = body.password;
    const full_name = body.full_name?.trim() || null;
    const role = body.role;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    try {
      const supabase = create_admin_client();
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (!data.user) {
        return NextResponse.json(
          { error: "Failed to create auth user" },
          { status: 400 },
        );
      }

      const profile = await auth_repository.create_user({
        actor_id: auth_user.id,
        id: data.user.id,
        email,
        full_name,
        role,
      });

      return NextResponse.json(to_user_response(profile), { status: 201 });
    } catch (error) {
      return handle_repository_error(error);
    }
  },

  // Update an existing user profile (self or super_admin managing another user).
  async update_user(body: UpdateUserBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const target_id = body.id?.trim() || auth_user.id;

    if (
      !body.email &&
      !body.full_name &&
      body.role === undefined &&
      !body.password
    ) {
      return NextResponse.json(
        { error: "At least one field is required to update" },
        { status: 400 },
      );
    }

    try {
      const profile = await auth_repository.update_user({
        actor_id: auth_user.id,
        id: target_id,
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        password: body.password,
      });

      return NextResponse.json(to_user_response(profile));
    } catch (error) {
      return handle_repository_error(error);
    }
  },

  // List users with pagination (super_admin/admin only).
  async list_users(request: Request) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    if (
      !auth_user.role ||
      (auth_user.role !== "super_admin" && auth_user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const role_param = searchParams.get("role") ?? undefined;

    const role = auth_user.role === "admin" ? "employee" : role_param;

    try {
      const result = await auth_repository.list_users({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        role,
      });

      return NextResponse.json({
        data: result.data.map(to_user_response),
        meta: result.meta,
      });
    } catch (error) {
      return handle_repository_error(error);
    }
  },

  // Get one user by id (super_admin/admin only).
  async get_user_by_id(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    if (
      !auth_user.role ||
      (auth_user.role !== "super_admin" && auth_user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const target_id = id.trim();

    if (!target_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const user = await auth_repository.find_by_id(target_id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (auth_user.role === "admin" && user.role !== "employee") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(to_user_response(user));
    } catch (error) {
      return handle_repository_error(error);
    }
  },
};
