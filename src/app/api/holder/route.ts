import "server-only";
import { NextResponse } from "next/server";
import { holders_controller } from "@/server/controllers/holders_controller";

type HolderBody = {
  name?: string;
};

type UpdateHolderBody = HolderBody & {
  id?: string;
};

// GET /api/holder
// GET /api/holder?id=<holder_id>
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id !== null) {
    return holders_controller.find_holder_by_id(id);
  }
  return holders_controller.list_holders(request);
}

// POST /api/holder
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HolderBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return holders_controller.create_holder(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// PATCH /api/holder
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateHolderBody;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return holders_controller.update_holder(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// DELETE /api/holder?id=<holder_id>
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  return holders_controller.delete_holder(id);
}
