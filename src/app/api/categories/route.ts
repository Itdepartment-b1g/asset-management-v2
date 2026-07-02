import "server-only";

import { NextResponse } from "next/server";
import { categoriesController } from "@/server/controllers/categories_controller";
import { requireAuthUser } from "@/server/auth/session";

export async function GET(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) return auth;

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    return categoriesController.getById(id, auth.id);
  }

  return categoriesController.list(auth.id);
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  return categoriesController.create(body, auth.id);
}

export async function PATCH(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  return categoriesController.update(body, auth.id);
}

export async function DELETE(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) return auth;

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return categoriesController.missingId();
  }

  return categoriesController.remove(id, auth.id);
}
