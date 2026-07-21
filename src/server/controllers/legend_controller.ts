import "server-only";

import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import {
  LegendForbiddenError,
  LegendNotFoundError,
  ValidationError,
  legend_repository,
} from "@/server/repositories/legend_repository";

type LegendBody = {
  name?: string;
  color?: string;
};

type UpdateLegendBody = LegendBody & {
  id?: string;
};

export const legend_controller = {

  // List all legends
  async list_legends(request: Request) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const { searchParams } = new URL(request.url);
    const page_param = searchParams.get("page");
    const limit_param = searchParams.get("limit");
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
      const result = await legend_repository.list_legends(auth_user.id, {
        page,
        limit,
      });

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof LegendForbiddenError) {
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

  // Find a legend by ID
  async get_legend_by_id(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const legend_id = id.trim();

    if (!legend_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const legend = await legend_repository.find_by_id(
        auth_user.id,
        legend_id,
      );

      return NextResponse.json(legend);
    } catch (error) {
      if (error instanceof LegendNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof LegendForbiddenError) {
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

  // Create a new legend
  async create_legend(body: LegendBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const name = body.name?.trim();
    const color = body.color?.trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!color) {
      return NextResponse.json({ error: "color is required" }, { status: 400 });
    }

    try {
      const legend = await legend_repository.create_legend(
        auth_user.id,
        name,
        color,
      );

      return NextResponse.json(legend, { status: 201 });
    } catch (error) {
      if (error instanceof LegendForbiddenError) {
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

  // Update a legend
  async update_legend(body: UpdateLegendBody) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const legend_id = body.id?.trim();
    const name = body.name?.trim();
    const color = body.color?.trim();

    if (!legend_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!color) {
      return NextResponse.json({ error: "color is required" }, { status: 400 });
    }

    try {
      const legend = await legend_repository.update_legend(
        auth_user.id,
        legend_id,
        name,
        color,
      );

      return NextResponse.json(legend);
    } catch (error) {
      if (error instanceof LegendNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof LegendForbiddenError) {
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

  // Delete a legend
  async delete_legend(id: string) {
    const auth_user = await requireAuthUser();

    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const legend_id = id.trim();

    if (!legend_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const legend = await legend_repository.delete_legend(
        auth_user.id,
        legend_id,
      );

      return NextResponse.json(legend);
    } catch (error) {
      if (error instanceof LegendNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof LegendForbiddenError) {
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
};
