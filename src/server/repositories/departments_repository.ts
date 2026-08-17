import "server-only";

import { prisma } from "@/server/prisma/client";
import { paginated_query, parse_pagination, type PaginationInput } from "@/server/lib/pagination";

const privileged_roles = new Set(["super_admin", "admin"]);

export class DepartmentForbiddenError extends Error {
    constructor(){
        super("You are not allowed to manage departments");
        this.name = "DepartmentForbiddenError";
    }
}
export class DepartmentNotFoundError extends Error {
    constructor(){
        super("Department not found");
        this.name = "DepartmentNotFoundError";
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
        throw new DepartmentForbiddenError();
    }
    return actor;
}
function validate_name(name: string){
    const trimmed_name = name.trim();
    if (trimmed_name.length < 3 || trimmed_name.length > 255) {
        throw new ValidationError("Name must be between 3 and 255 characters");
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed_name)) {
        throw new ValidationError("Name must contain only letters, numbers and spaces");
    }
    return name;
}
async function assert_name_available(trimmed_name: string, exclude_id?: string) {
    const existing = await prisma.departments.findFirst({
      where: {
        name: trimmed_name,
        ...(exclude_id ? { id: { not: exclude_id } } : {}),
      },
    });
  
    if (existing) {
      throw new ValidationError("A department with this name already exists");
    }
  }

export const departments_repository = {

    async list_departments(actor_id: string, input?: PaginationInput) {
        await assert_privileged_actor(actor_id);
        const { page, limit, skip, take } = parse_pagination(input);
        return paginated_query({
            page,
            limit,
            skip,
            take,
            count: () => prisma.departments.count(),
            find_many: ({ skip, take }) =>
                prisma.departments.findMany({
                    orderBy: { created_at: "desc" },
                    skip,
                    take,
                }),
        });
    },
    async find_by_id(actor_id: string, id: string) {
        await assert_privileged_actor(actor_id);
        const department = await prisma.departments.findUnique({ where: { id } });
        if (!department) {
            throw new DepartmentNotFoundError();
        }
        return department;
    },
    async create_department(actor_id: string, name: string) {
        await assert_privileged_actor(actor_id);
        const validated_name = validate_name(name);
        await assert_name_available(validated_name);
        const department = await prisma.departments.create({ data: { name: validated_name, created_by_id: actor_id } });
        return department;
    },
    async update_department(actor_id: string, id: string, name: string) {
        await assert_privileged_actor(actor_id);
        const validated_name = validate_name(name);
        
        const department = await prisma.departments.update({ where: { id }, data: { name: validated_name } });
        return department;
    },
    async delete_department(actor_id: string, id: string) {
        await assert_privileged_actor(actor_id);
        const department = await prisma.departments.delete({ where: { id } });
        return department;
    },
}
