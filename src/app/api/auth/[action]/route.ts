import "server-only";

import { NextResponse } from "next/server";
import { auth_controller } from "@/server/controllers/auth_controller";

type RouteContext = {
  params: Promise<{ action: string }>;
};

type LoginBody = {
  email?: string;
  password?: string;
};

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

// Parse JSON request bodies and return 400 when the payload is invalid.
async function parse_json_body<T>(request: Request): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// POST /api/auth/login
// POST /api/auth/create-user
// GET  /api/auth/users
export async function POST(request: Request, context: RouteContext) {
  const { action } = await context.params;

  if (action === "login") {
    const body = await parse_json_body<LoginBody>(request);
    if (body instanceof NextResponse) {
      return body;
    }

    return auth_controller.login(body);
  }

  if (action === "create-user") {
    const body = await parse_json_body<CreateUserBody>(request);
    if (body instanceof NextResponse) {
      return body;
    }

    return auth_controller.create_user(body);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// GET /api/auth/users
export async function GET(request: Request, context: RouteContext) {
  const { action } = await context.params;

  if (action === "users") {
    const id = new URL(request.url).searchParams.get("id");

    if (id) {
      return auth_controller.get_user_by_id(id);
    }

    return auth_controller.list_users(request);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// PATCH /api/auth/update-user
export async function PATCH(request: Request, context: RouteContext) {
  const { action } = await context.params;

  if (action === "update-user") {
    const body = await parse_json_body<UpdateUserBody>(request);
    if (body instanceof NextResponse) {
      return body;
    }

    return auth_controller.update_user(body);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
