import "server-only";

import { NextResponse } from "next/server";
import { assets_controller } from "@/server/controllers/assets_controller";

export const runtime = "nodejs";

type TransferBody = {
  asset_id?: string;
  to_user_id?: string;
  remarks?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TransferBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return assets_controller.transfer_asset(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
