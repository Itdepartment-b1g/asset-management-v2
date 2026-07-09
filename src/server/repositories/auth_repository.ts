import "server-only";

import { createClient } from "@/lib/supabase/server";
import { create_admin_client } from "@/lib/supabase/admin";
import { prisma } from "@/server/prisma/client";
import {
  paginated_query,
  parse_pagination,
  type PaginationInput,
} from "@/server/lib/pagination";

const PRIVILEGED_ROLES = new Set(["super_admin", "admin"]);
const MANAGER_ROLES = new Set(["super_admin"]);

const CREATABLE_ROLES_BY_ACTOR: Record<string, Set<string>> = {
  super_admin: new Set(["super_admin", "admin", "employee"]),
  admin: new Set(["employee"]),
};

export class UserCreationForbiddenError extends Error {
  constructor() {
    super("You are not allowed to create this user");
    this.name = "UserCreationForbiddenError";
  }
}

export class UserUpdateForbiddenError extends Error {
  constructor() {
    super("You can only update your own profile unless you are a super_admin");
    this.name = "UserUpdateForbiddenError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type CreateUserData = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  password?: string;
};

async function assert_can_create_user(
  actor_id: string,
  role: string | null | undefined,
) {
  const actor = await prisma.user.findUnique({ where: { id: actor_id } });

  if (!actor?.role || !PRIVILEGED_ROLES.has(actor.role)) {
    throw new UserCreationForbiddenError();
  }

  if (!role || !CREATABLE_ROLES_BY_ACTOR[actor.role]?.has(role)) {
    throw new UserCreationForbiddenError();
  }
}

export const auth_repository = {
  // Fetch a user profile by Supabase auth user id.
  find_by_id(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  // List users with reusable server pagination.
  async list_users(input?: PaginationInput & { role?: string }) {
    const { page, limit, skip, take } = parse_pagination(input);
    const where = input?.role ? { role: input.role } : undefined;

    return paginated_query({
      page,
      limit,
      skip,
      take,
      count: () => prisma.user.count({ where }),
      find_many: ({ skip, take }) =>
        prisma.user.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
    });
  },

  // Create a new profile.
  // - super_admin can create: super_admin, admin, employee
  // - admin can create: employee only
  async create_user({
    actor_id,
    id,
    email,
    full_name,
    role,
  }: CreateUserData & { actor_id: string }) {
    await assert_can_create_user(actor_id, role);

    return prisma.user.create({
      data: { id, email, full_name, role },
    });
  },

  // Sync email/full_name after login. Profile must already exist.
  async sync_profile_on_login({
    id,
    email,
    full_name,
  }: Pick<CreateUserData, "id" | "email" | "full_name">) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new UserNotFoundError();
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined ? { email } : {}),
        ...(full_name !== undefined ? { full_name } : {}),
      },
    });
  },

  // Update an existing profile only.
  //
  // Update rules:
  // - employee updating self: can update full_name and password.
  // - super_admin/admin updating self: can also update email and role.
  // - super_admin updating another user: can update email, full_name, role, and password.
  // - employee updating another user: not allowed.
  async update_user({
    actor_id,
    id,
    email,
    full_name,
    role,
    password,
  }: CreateUserData & { actor_id: string }) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new UserNotFoundError();
    }

    const is_self_update = actor_id === id;
    let can_edit_sensitive_fields = false;
    let can_manage_other_user = false;

    if (is_self_update) {
      const actor = await prisma.user.findUnique({ where: { id: actor_id } });
      can_edit_sensitive_fields =
        !!actor?.role && PRIVILEGED_ROLES.has(actor.role);
    } else {
      const actor = await prisma.user.findUnique({ where: { id: actor_id } });

      if (!actor?.role || !MANAGER_ROLES.has(actor.role)) {
        throw new UserUpdateForbiddenError();
      }

      can_manage_other_user = true;
      can_edit_sensitive_fields = true;
    }

    if (role !== undefined && !can_edit_sensitive_fields) {
      throw new UserUpdateForbiddenError();
    }

    if (
      email !== undefined &&
      email !== existing.email &&
      !can_edit_sensitive_fields &&
      !can_manage_other_user
    ) {
      throw new UserUpdateForbiddenError();
    }

    if (password !== undefined) {
      if (!is_self_update && !can_manage_other_user) {
        throw new UserUpdateForbiddenError();
      }

      if (password.length < 6) {
        throw new ValidationError("password must be at least 6 characters");
      }

      if (is_self_update) {
        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw new ValidationError(error.message);
        }
      } else {
        const supabase = create_admin_client();
        const { error } = await supabase.auth.admin.updateUserById(id, {
          password,
        });

        if (error) {
          throw new ValidationError(error.message);
        }
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...(full_name !== undefined ? { full_name } : {}),
        ...((can_edit_sensitive_fields || can_manage_other_user) &&
        email !== undefined
          ? { email }
          : {}),
        ...(can_edit_sensitive_fields && role !== undefined ? { role } : {}),
      },
    });
  },
};
