import "server-only";
import { prisma } from "@/server/prisma/client";
import {
  paginated_query,
  parse_pagination,
  type PaginationInput,
} from "@/server/lib/pagination";

const privileged_roles = new Set(["super_admin", "admin"]);

export class HolderForbiddenError extends Error {
  constructor() {
    super("You are not allowed to manage shared pools");
    this.name = "HolderForbiddenError";
  }
}

export class HolderNotFoundError extends Error {
  constructor() {
    super("Shared pool not found");
    this.name = "HolderNotFoundError";
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
  if (!actor?.role || !privileged_roles.has(actor.role)) {
    throw new HolderForbiddenError();
  }
}

function validate_name(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new ValidationError("Name is required");
  }
  return trimmed;
}

export const holders_repository = {
  async list_holders(
    actor_id: string,
    input?: PaginationInput & { search?: string },
  ) {
    await assert_privileged_actor(actor_id);

    const { page, limit, skip, take } = parse_pagination(input);
    const search = input?.search?.trim();
    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : undefined;

    return paginated_query({
      page,
      limit,
      skip,
      take,
      count: () => prisma.holders.count({ where }),
      find_many: ({ skip, take }) =>
        prisma.holders.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
    });
  },

  async find_holder_by_id(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);

    const holder = await prisma.holders.findUnique({
      where: { id: id.trim() },
    });
    if (!holder) {
      throw new HolderNotFoundError();
    }
    return holder;
  },

  async create_holder(actor_id: string, name: string) {
    await assert_privileged_actor(actor_id);

    return prisma.holders.create({
      data: {
        name: validate_name(name),
        created_by_id: actor_id,
      },
    });
  },

  async update_holder(actor_id: string, id: string, name: string) {
    await assert_privileged_actor(actor_id);

    const holder_id = id.trim();
    if (!holder_id) {
      throw new ValidationError("id is required");
    }

    const existing = await prisma.holders.findUnique({
      where: { id: holder_id },
    });
    if (!existing) {
      throw new HolderNotFoundError();
    }

    return prisma.holders.update({
      where: { id: holder_id },
      data: { name: validate_name(name) },
    });
  },

  async delete_holder(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);

    const holder_id = id.trim();
    if (!holder_id) {
      throw new ValidationError("id is required");
    }

    const existing = await prisma.holders.findUnique({
      where: { id: holder_id },
    });
    if (!existing) {
      throw new HolderNotFoundError();
    }

    return prisma.holders.delete({
      where: { id: holder_id },
    });
  },
};
