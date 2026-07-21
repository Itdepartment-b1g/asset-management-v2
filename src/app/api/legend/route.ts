import "server-only";

import { NextResponse } from "next/server";
import { legend_controller } from "@/server/controllers/legend_controller";

type LegendBody = {
  name?: string;
  color?: string;
};

type UpdateLegendBody = LegendBody & {
  id?: string;
};

// GET /api/legend
// GET /api/legend?id=<legend_id>
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (id !== null) {
    return legend_controller.get_legend_by_id(id);
  }

  return legend_controller.list_legends(request);
}

// POST /api/legend
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LegendBody;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    return legend_controller.create_legend(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// PATCH /api/legend
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateLegendBody;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    return legend_controller.update_legend(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// DELETE /api/legend?id=<legend_id>
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  return legend_controller.delete_legend(id);
}
