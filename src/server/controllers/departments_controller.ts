import "server-only";

import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import {
  DepartmentForbiddenError,
  DepartmentNotFoundError,
  departments_repository,
  ValidationError,
} from "@/server/repositories/departments_repository";

type DepartmentBody = {
  name?: string;
};

type UpdateDepartmentBody = DepartmentBody & {
  id?: string;
};

export const departments_controller = {
  async list_departments(request: Request) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const { searchParams } = new URL(request.url);
    const page_param = searchParams.get("page");
    const limit_param = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || undefined;
    const page = page_param === null ? undefined : Number(page_param);
    const limit = limit_param === null ? undefined : Number(limit_param);

    if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
      return NextResponse.json(
        { error: "page must be a positive integer" },
        { status: 400 },
      );
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      return NextResponse.json(
        { error: "limit must be a positive integer" },
        { status: 400 },
      );
    }

    try {
      const result = await departments_repository.list_departments(
        auth_user.id,
        { page, limit, search },
      );

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof DepartmentForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof Error) {
        console.error(error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },

  async find_department_by_id(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const department_id = id.trim();

    if (!department_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const department = await departments_repository.find_by_id(
        auth_user.id,
        department_id,
      );

      return NextResponse.json(department);
    } catch (error) {
      if (error instanceof DepartmentForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof DepartmentNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof Error) {
        console.error(error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },

  async create_department(body: DepartmentBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }
    
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const department = await departments_repository.create_department(
        auth_user.id,
        name,
      );

      return NextResponse.json(department, { status: 201 });
    } catch (error) {
      if (error instanceof DepartmentForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof Error) {
        console.error(error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },

  async update_department(body: UpdateDepartmentBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const department_id = body.id?.trim();
    const name = body.name?.trim();

    if (!department_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const department = await departments_repository.update_department(
        auth_user.id,
        department_id,
        name,
      );

      return NextResponse.json(department);
    } catch (error) {
      if (error instanceof DepartmentForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof DepartmentNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof Error) {
        console.error(error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },

  async delete_department(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const department_id = id.trim();

    if (!department_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const department = await departments_repository.delete_department(
        auth_user.id,
        department_id,
      );

      return NextResponse.json(department);
    } catch (error) {
      if (error instanceof DepartmentForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof DepartmentNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof Error) {
        console.error(error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
};