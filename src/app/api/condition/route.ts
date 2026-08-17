import  "server-only";
import { NextResponse } from "next/server";
import { conditions_controller } from "@/server/controllers/condition_controller";

type ConditionBody = {
    name?: string;
  };
  type UpdateConditionBody = ConditionBody & {
    id?: string;
  };
  export async function GET(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    if (id !== null) {
      return conditions_controller.find_condition_by_id(id);
    }
    return conditions_controller.list_conditions(request);
  }
  export async function POST(request: Request) {
    try {
      const body = (await request.json()) as ConditionBody;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      return conditions_controller.create_condition(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }
  export async function PATCH(request: Request) {
    try {
      const body = (await request.json()) as UpdateConditionBody;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      return conditions_controller.update_condition(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }
  export async function DELETE(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    if (id === null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    return conditions_controller.delete_condition(id);
  }