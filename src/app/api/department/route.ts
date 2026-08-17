import  "server-only";
import { NextResponse } from "next/server";
import { departments_controller } from "@/server/controllers/departments_controller";

type DepartmentBody = {
    name?: string;
  };
  type UpdateDepartmentBody = DepartmentBody & {
    id?: string;
  };
  export async function GET(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    if (id !== null) {
      return departments_controller.find_department_by_id(id);
    }
    return departments_controller.list_departments(request);
  }
  export async function POST(request: Request) {
    try {
      const body = (await request.json()) as DepartmentBody;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      return departments_controller.create_department(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }
  export async function PATCH(request: Request) {
    try {
      const body = (await request.json()) as UpdateDepartmentBody;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      return departments_controller.update_department(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }
  export async function DELETE(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    if (id === null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    return departments_controller.delete_department(id);
  }