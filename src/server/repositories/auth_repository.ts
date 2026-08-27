import "server-only";

import { createClient } from "@/lib/supabase/server";
import { create_admin_client } from "@/lib/supabase/admin";
import { prisma } from "@/server/prisma/client";
import {
  paginated_query,
  parse_pagination,
  type PaginationInput,
} from "@/server/lib/pagination";
import { ROLES, USER_MANAGEMENT_ROLES } from "@/lib/auth/roles";

const PRIVILEGED_ROLES = USER_MANAGEMENT_ROLES;
const MANAGER_ROLES = new Set<string>([ROLES.super_admin]);

const CREATABLE_ROLES_BY_ACTOR: Record<string, Set<string>> = {
  super_admin: new Set([
    ROLES.super_admin,
    ROLES.admin,
    ROLES.asset_manager,
    ROLES.employee,
    ROLES.department_head,
    ROLES.head_operations,
    ROLES.operations_manager,
  ]),
  admin: new Set([ROLES.employee]),
};

const user_with_relations = {
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  created_by: {
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  },
} as const;

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
  department_id?: string | null;
  password?: string;
};

export type HrisUserData = {
  hris_employee_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  is_active: boolean;
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

async function assert_department_exists(department_id: string) {
  const department = await prisma.departments.findUnique({
    where: { id: department_id },
  });

  if (!department) {
    throw new ValidationError("Department not found");
  }
}

export const auth_repository = {
  // Fetch a user profile by Supabase auth user id.
  find_by_id(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  find_by_id_with_relations(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: user_with_relations,
    });
  },

  find_by_employee_code(employee_code: string) {
    return prisma.user.findUnique({ where: { employee_code } });
  },

  // Create or update a profile from HRIS SSO. Role is never overwritten.
  async upsert_from_hris({
    supabase_user_id,
    hris_employee_id,
    employee_code,
    email,
    full_name,
    is_active,
  }: HrisUserData & { supabase_user_id: string }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ employee_code }, { hris_employee_id }],
      },
    });

    const sync_data = {
      employee_code,
      hris_employee_id,
      email,
      full_name,
      is_active,
      last_login_at: new Date(),
    };

    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: sync_data,
        include: user_with_relations,
      });
    }

    return prisma.user.create({
      data: {
        id: supabase_user_id,
        ...sync_data,
      },
      include: user_with_relations,
    });
  },

  // List users with reusable server pagination.
  async list_users(
    input?: PaginationInput & {
      role?: string;
      search?: string;
      department_id?: string;
    },
  ) {
    const { page, limit, skip, take } = parse_pagination(input);
    const search = input?.search?.trim();
    const where = {
      ...(input?.role ? { role: input.role } : {}),
      ...(input?.department_id ? { department_id: input.department_id } : {}),
      ...(search
        ? {
            OR: [
              { full_name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    return paginated_query({
      page,
      limit,
      skip,
      take,
      count: () => prisma.user.count({ where }),
      find_many: ({ skip, take }) =>
        prisma.user.findMany({
          where,
          include: user_with_relations,
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
    department_id,
  }: CreateUserData & { actor_id: string }) {
    await assert_can_create_user(actor_id, role);

    if (!department_id) {
      throw new ValidationError("department is required");
    }

    await assert_department_exists(department_id);

    return prisma.user.create({
      data: {
        id,
        email,
        full_name,
        role,
        department_id,
        created_by_id: actor_id,
      },
      include: user_with_relations,
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
      include: user_with_relations,
    });
  },

  // Update an existing profile only.
  //
  // Update rules:
  // - employee updating self: can update full_name and password.
  // - super_admin/admin updating self: can also update email and role.
  // - super_admin updating another user: can update email, full_name, role, password, and department.
  // - employee updating another user: not allowed.
  async update_user({
    actor_id,
    id,
    email,
    full_name,
    role,
    department_id,
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

    const next_email =
      email !== undefined &&
      email !== existing.email &&
      (can_edit_sensitive_fields || can_manage_other_user)
        ? email
        : undefined;

    if (password !== undefined) {
      if (!is_self_update && !can_manage_other_user) {
        throw new UserUpdateForbiddenError();
      }

      if (password.length < 6) {
        throw new ValidationError("password must be at least 6 characters");
      }
    }

    if (is_self_update && password !== undefined) {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new ValidationError(error.message);
      }
    }

    if (can_manage_other_user && (password !== undefined || next_email)) {
      const supabase = create_admin_client();
      const { error } = await supabase.auth.admin.updateUserById(id, {
        ...(password !== undefined ? { password } : {}),
        ...(next_email ? { email: next_email } : {}),
      });

      if (error) {
        throw new ValidationError(error.message);
      }
    }

    const can_update_department =
      can_edit_sensitive_fields || can_manage_other_user;

    if (department_id !== undefined && !can_update_department) {
      throw new UserUpdateForbiddenError();
    }

    if (department_id) {
      await assert_department_exists(department_id);
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
        ...(can_update_department && department_id !== undefined
          ? { department_id }
          : {}),
      },
      include: user_with_relations,
    });
  },
};
