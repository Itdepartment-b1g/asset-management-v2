import "server-only";
import { prisma } from "@/server/prisma/client";
import {paginated_query, parse_pagination, type PaginationInput} from "@/server/lib/pagination";

const privileged_roles = new Set(["super_admin", "admin"]);

export class LocationForbiddenError extends Error {
    constructor(){
        super("You are not allowed to manage locations");
        this.name = "LocationForbiddenError";
    }
}

export class LocationNotFoundError extends Error {
    constructor(){
        super("Location not found");
        this.name = "LocationNotFoundError";
    }
}

export class ValidationError extends Error{
    constructor(message: string){
        super(message);
        this.name = "ValidationError";
    }
}

async function assert_privileged_actor(actor_id: string){
    const actor = await prisma.user.findUnique({ where: { id: actor_id } });
    if (!actor?.role || !privileged_roles.has(actor.role)) {
        throw new LocationForbiddenError();
    }
}

function validate_name(name: string){
    const trimmed = name.trim();
    if (!trimmed) {
        throw new ValidationError("Name is required");
    }
    return trimmed;
}

export const locations_repository = {

    // List all locations
    async list_locations(
        actor_id: string,
        input?: PaginationInput & { search?: string },
    ) {
        await assert_privileged_actor(actor_id);

        const {page, limit, skip, take} = parse_pagination(input);
        const search = input?.search?.trim();
        const where = search
            ? { name: { contains: search, mode: "insensitive" as const } }
            : undefined;

        return paginated_query({
            page,
            limit,
            skip,
            take,
            count: () => prisma.locations.count({ where }),
            find_many: ({skip, take}) => prisma.locations.findMany({
                where,
                orderBy: {created_at: "desc"},
                skip,
                take,
            }),
        })
    },

    // Find a location by ID
    async find_location_by_id(actor_id: string, id:string){
        await assert_privileged_actor(actor_id);

        const location = await prisma.locations.findUnique({ where: { id: id.trim() } });
        if (!location) {
            throw new LocationNotFoundError();
        }
        return location;
    },

    async create_location(actor_id: string, name: string){
        await assert_privileged_actor(actor_id);

        return prisma.locations.create({
            data: {
                name: validate_name(name),
                created_by_id: actor_id,
            }
        })
    },

    // Update a location
    async update_location(actor_id: string, id: string, name: string){
        await assert_privileged_actor(actor_id);

        const location_id = id.trim();

        if(!location_id){
            throw new ValidationError("id is required");
        }

        const existing = await prisma.locations.findUnique({
            where:{id: location_id,}
        });

        if(!existing){
            throw new LocationNotFoundError();
        }

        return prisma.locations.update({
            where:{id: location_id},
            data:{ name: validate_name(name),}
        })
    },
    
    async delete_location(actor_id: string, id: string){
        await assert_privileged_actor(actor_id);

        const legend_id = id.trim();

        if(!legend_id){
            throw new ValidationError("id is required");
        }

        const existing = await prisma.locations.findUnique({
            where:{id: legend_id}
        })

        if(!existing){
            throw new LocationNotFoundError();
        }

        return prisma.locations.delete({
            where:{id: legend_id}
        })
    }
}
