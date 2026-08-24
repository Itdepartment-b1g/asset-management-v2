import "server-only";

import { NextResponse } from "next/server";
import { assets_controller } from "@/server/controllers/assets_controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  if (id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const download =
    params.get("download") === "1" || params.get("download") === "true";
  return assets_controller.get_photo(id, download);
}
