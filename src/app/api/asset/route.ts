import "server-only";

import { NextResponse } from "next/server";
import { assets_controller } from "@/server/controllers/assets_controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id !== null) {
    return assets_controller.find_asset_by_id(id);
  }
  return assets_controller.list_assets(request);
}

export async function POST(request: Request) {
  const content_type = request.headers.get("content-type") ?? "";
  if (!content_type.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  try {
    const form = await request.formData();
    return assets_controller.create_asset(form);
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const content_type = request.headers.get("content-type") ?? "";
  if (!content_type.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  try {
    const form = await request.formData();
    return assets_controller.update_asset(form);
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  return assets_controller.delete_asset(id);
}
