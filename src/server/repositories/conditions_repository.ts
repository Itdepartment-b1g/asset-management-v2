import "server-only";

import { prisma } from "@/server/prisma/client";
import { paginated_query, parse_pagination, type PaginationInput } from "@/server/lib/pagination";
import { DepartmentNotFoundError } from "./departments_repository";

import { ASSET_PRIVILEGED_ROLES } from "@/lib/auth/roles";

const privileged_roles = ASSET_PRIVILEGED_ROLES;

export class ConditionForbiddenError extends Error {
    constructor(){
        super("You are not allowed to manage conditions");
        this.name = "ConditionForbiddenError";
    }
}
export class ConditionNotFoundError extends Error {
    constructor(){
        super("Condition not found");
        this.name = "ConditionNotFoundError";
    }
}
export class ValidationError extends Error {
    constructor(message: string){
        super(message);
        this.name = "ValidationError";
    }
}


async function assert_privileged_actor(actor_id: string){
    const actor = await prisma.user.findUnique({ where: { id: actor_id } });
    if (!actor?.role || !privileged_roles.has(actor.role)) {
        throw new ConditionForbiddenError();
    }
    return actor;
}
function validate_name(name: string){
    const trimmed_name = name.trim();
    if (trimmed_name.length < 2 || trimmed_name.length > 255) {
        throw new ValidationError("Name must be between 2 and 255 characters");
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed_name)) {
        throw new ValidationError("Name must contain only letters, numbers and spaces");
    }
    return name;
}
async function assert_name_available(trimmed_name: string, exclude_id?: string) {
    const existing = await prisma.conditions.findFirst({
      where: {
        name: trimmed_name,
        ...(exclude_id ? { id: { not: exclude_id } } : {}),
      },
    });
  
    if (existing) {
      throw new ValidationError("A condition with this name already exists");
    }
  }

export const conditions_repository = {

    async list_conditions(
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
            count: () => prisma.conditions.count({ where }),
            find_many: ({ skip, take }) =>
                prisma.conditions.findMany({
                    where,
                    orderBy: { created_at: "desc" },
                    skip,
                    take,
                }),
        });
    },
    async find_by_id(actor_id: string, id: string) {
        await assert_privileged_actor(actor_id);
        const condition = await prisma.conditions.findUnique({ where: { id } });
        if (!condition) {
            throw new ConditionNotFoundError();
        }
        return condition;
    },
    async create_condition(actor_id: string, name: string) {
        await assert_privileged_actor(actor_id);
        const validated_name = validate_name(name);
        await assert_name_available(validated_name);
        const condition = await prisma.conditions.create({ data: { name: validated_name, created_by_id: actor_id } });
        return condition;
    },
    async update_condition(actor_id: string, id: string, name: string) {
        await assert_privileged_actor(actor_id);
        const validated_name = validate_name(name);
        
        const condition = await prisma.conditions.update({ where: { id }, data: { name: validated_name } });
        return condition;
    },
    async delete_condition(actor_id: string, id: string) {
        await assert_privileged_actor(actor_id);
        const condition = await prisma.conditions.delete({ where: { id } });
        return condition;
    },
}
