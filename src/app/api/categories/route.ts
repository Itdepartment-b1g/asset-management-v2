import "server-only";

import { categoriesController } from "@/server/controllers/categories_controller";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    return categoriesController.getById(id);
  }

  return categoriesController.list();
}

export async function POST(request: Request) {
  const body = await request.json();
  return categoriesController.create(body);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return categoriesController.update(body);
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return categoriesController.missingId();
  }

  return categoriesController.remove(id);
}
