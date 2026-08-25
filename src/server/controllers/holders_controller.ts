import "server-only";

import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import {
  HolderForbiddenError,
  HolderNotFoundError,
  holders_repository,
  ValidationError,
} from "@/server/repositories/holders_repository";

type HolderBody = {
  name?: string;
};

type UpdateHolderBody = HolderBody & {
  id?: string;
};

export const holders_controller = {
  async list_holders(request: Request) {
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
      const result = await holders_repository.list_holders(auth_user.id, {
        page,
        limit,
        search,
      });

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof HolderForbiddenError) {
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

  async find_holder_by_id(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const holder_id = id.trim();

    if (!holder_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const holder = await holders_repository.find_holder_by_id(
        auth_user.id,
        holder_id,
      );

      return NextResponse.json(holder);
    } catch (error) {
      if (error instanceof HolderForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      if (error instanceof HolderNotFoundError) {
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

  async create_holder(body: HolderBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const holder = await holders_repository.create_holder(auth_user.id, name);

      return NextResponse.json(holder, { status: 201 });
    } catch (error) {
      if (error instanceof HolderForbiddenError) {
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

  async update_holder(body: UpdateHolderBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const holder_id = body.id?.trim();
    const name = body.name?.trim();

    if (!holder_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    try {
      const holder = await holders_repository.update_holder(
        auth_user.id,
        holder_id,
        name,
      );

      return NextResponse.json(holder);
    } catch (error) {
      if (error instanceof HolderForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error instanceof HolderNotFoundError) {
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

  async delete_holder(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const holder_id = id.trim();

    if (!holder_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const holder = await holders_repository.delete_holder(
        auth_user.id,
        holder_id,
      );

      return NextResponse.json(holder);
    } catch (error) {
      if (error instanceof HolderForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error instanceof HolderNotFoundError) {
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
