import "server-only";

import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import {
  ConditionForbiddenError,
  ConditionNotFoundError,
  conditions_repository,
  ValidationError,
} from "@/server/repositories/conditions_repository";

type ConditionBody = {
  name?: string;
};

type UpdateConditionBody = ConditionBody & {
  id?: string;
};

export const conditions_controller = {
  async list_conditions(request: Request) {
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
      const result = await conditions_repository.list_conditions(
        auth_user.id,
        { page, limit, search },
      );

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ConditionForbiddenError) {
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

  async find_condition_by_id(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const condition_id = id.trim();

    if (!condition_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        const condition = await conditions_repository.find_by_id(
        auth_user.id,
        condition_id,
      );

      return NextResponse.json(condition);
    } catch (error) {
      if (error instanceof ConditionForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof ConditionNotFoundError) {
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

  async create_condition(body: ConditionBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }
    
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const condition = await conditions_repository.create_condition(
        auth_user.id,
        name,
      );

      return NextResponse.json(condition, { status: 201 });
    } catch (error) {
      if (error instanceof ConditionForbiddenError) {
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

  async update_condition(body: UpdateConditionBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const condition_id = body.id?.trim();
    const name = body.name?.trim();

    if (!condition_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const condition = await conditions_repository.update_condition(
        auth_user.id,
        condition_id,
        name,
      );

      return NextResponse.json(condition);
    } catch (error) {
      if (error instanceof ConditionForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof ConditionNotFoundError) {
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

  async delete_condition(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const condition_id = id.trim();

    if (!condition_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const condition = await conditions_repository.delete_condition(
        auth_user.id,
        condition_id,
      );

      return NextResponse.json(condition);
    } catch (error) {
      if (error instanceof ConditionForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof ConditionNotFoundError) {
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