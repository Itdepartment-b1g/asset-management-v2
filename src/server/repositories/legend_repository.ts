import "server-only";

import { prisma } from "@/server/prisma/client";
import {
  paginated_query,
  parse_pagination,
  type PaginationInput,
} from "@/server/lib/pagination";

import { ASSET_PRIVILEGED_ROLES } from "@/lib/auth/roles";

const PRIVILEGED_ROLES = ASSET_PRIVILEGED_ROLES;

export class LegendForbiddenError extends Error {
  constructor() {
    super("You are not allowed to manage legends");
    this.name = "LegendForbiddenError";
  }
}

export class LegendNotFoundError extends Error {
  constructor() {
    super("Legend not found");
    this.name = "LegendNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

async function assert_privileged_actor(actor_id: string) {
  const actor = await prisma.user.findUnique({ where: { id: actor_id } });

  if (!actor?.role || !PRIVILEGED_ROLES.has(actor.role)) {
    throw new LegendForbiddenError();
  }
}

function validate_name(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new ValidationError("name is required");
  }

  return trimmed;
}

function validate_color(color: string) {
  const trimmed = color.trim();

  if (!trimmed) {
    throw new ValidationError("color is required");
  }

  return trimmed;
}
export const legend_repository = {
  async list_legends(
    actor_id: string,
    input?: PaginationInput & { search?: string },
  ) {
    await assert_privileged_actor(actor_id);

    const { page, limit, skip, take } = parse_pagination(input);
    const search = input?.search?.trim();
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { color: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    return paginated_query({
      page,
      limit,
      skip,
      take,
      count: () => prisma.legend.count({ where }),
      find_many: ({ skip, take }) =>
        prisma.legend.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
    });
  },

  async find_by_id(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);

    const legend = await prisma.legend.findUnique({
      where: { id: id.trim() },
    });

    if (!legend) {
      throw new LegendNotFoundError();
    }

    return legend;
  },

  async create_legend(actor_id: string, name: string, color: string) {
    await assert_privileged_actor(actor_id);

    return prisma.legend.create({
      data: {
        name: validate_name(name),
        color: validate_color(color),
        created_by_id: actor_id,
      },
    });
  },

  async update_legend(actor_id: string, id: string, name: string, color: string) {
    await assert_privileged_actor(actor_id);

    const legend_id = id.trim();

    if (!legend_id) {
      throw new ValidationError("id is required");
    }

    const existing = await prisma.legend.findUnique({
      where: { id: legend_id },
    });

    if (!existing) {
      throw new LegendNotFoundError();
    }

    return prisma.legend.update({
      where: { id: legend_id },
      data: {
         name: validate_name(name),
          color: validate_color(color),
        },
    });
  },

  async delete_legend(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);

    const legend_id = id.trim();

    if (!legend_id) {
      throw new ValidationError("id is required");
    }

    const existing = await prisma.legend.findUnique({
      where: { id: legend_id },
    });

    if (!existing) {
      throw new LegendNotFoundError();
    }

    return prisma.legend.delete({
      where: { id: legend_id },
    });
  },
};
