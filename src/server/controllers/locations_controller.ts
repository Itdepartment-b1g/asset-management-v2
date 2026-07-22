import "server-only";

import { NextResponse } from "next/server";
import {requireAuthUser} from "@/server/auth/session";
import {
    LocationForbiddenError,
    LocationNotFoundError,
    locations_repository,
    ValidationError,
} from "@/server/repositories/locations_repository";

type LocationBody = {
    name?: string;
};

type UpdateLocationBody = LocationBody & {
    id?: string;
}

export const locations_controller = {

    // List all locations
    async list_locations(request: Request) {
        const auth_user = await requireAuthUser();

        if(auth_user instanceof NextResponse){
            return auth_user;
        }

        const {searchParams} = new URL(request.url)
        const page_param = searchParams.get("page");
        const limit_param = searchParams.get("limit");
        const page = page_param === null ? undefined : Number(page_param);
        const limit = limit_param === null ? undefined : Number(limit_param);

        if(page !== undefined && (!Number.isInteger(page) || page < 1)){
            return NextResponse.json(
                {error: "page must be a positive integer"},
                {status: 400}
            );
        }

        if(limit !== undefined && (!Number.isInteger(limit) || limit < 1)){
            return NextResponse.json(
                {error: "limit must be a positive integer"},
                {status: 400}
            );
        }

        try {
            const result = await locations_repository.list_locations(auth_user.id, {
                page,
                limit,
            });

            return NextResponse.json(result);
        }catch(error){
            if(error instanceof LocationForbiddenError){
                return NextResponse.json({ error: error.message}, {status: 403});
            }

            if(error instanceof ValidationError){
                return NextResponse.json({ error: error.message}, {status: 400});
            }

            if(error instanceof Error){
                console.error(error);
            }
            return NextResponse.json(
                {error: "Internal server error"},
                {status: 500}
            )
        }
    },

    // Find a location by ID
    async find_location_by_id(id: string){
        const auth_user = await requireAuthUser();

        if(auth_user instanceof NextResponse){
            return auth_user;
        }

        const location_id = id.trim();

        if(!location_id){
            return NextResponse.json({error: "id is required"}, {status: 400});
        }

        try{
            const location = await locations_repository.find_location_by_id(
                auth_user.id,
                location_id,
            );

            return NextResponse.json(location);
        }catch (error){
            if(error instanceof LocationForbiddenError){
                return NextResponse.json({error: error.message}, {status: 403});
            }

            if(error instanceof LocationNotFoundError){
                return NextResponse.json({error: error.message}, {status: 404});
            }

            if(error instanceof ValidationError){
                return NextResponse.json({error: error.message}, {status: 400});
            }
            if(error instanceof Error){
                console.error(error);
            }
            return NextResponse.json(
                {error: "Internal server error"},
                {status: 500}
            )
        }
    },

    // Create a new location
    async create_location(body: LocationBody){
        const auth_user = await requireAuthUser();

        if(auth_user instanceof NextResponse){
            return auth_user;
        }

        const {name} = body;

        if(!name){
            return NextResponse.json({error: "name is required"}, {status: 400});
        }

        try{
            const location = await locations_repository.create_location(auth_user.id, name);

            return NextResponse.json(location, {status: 201});
        }catch(error){
            if(error instanceof LocationForbiddenError){
                return NextResponse.json({error: error.message}, {status: 403});
            }
            if(error instanceof ValidationError){
                return NextResponse.json({error: error.message}, {status: 400});
            }
            if(error instanceof Error){
                console.error(error);
            }
            return NextResponse.json(
                {error: "Internal server error"},
                {status: 500}
            )
        }
    },

    // Update a location
    async update_location(body: UpdateLocationBody){
        const auth_user = await requireAuthUser();

        if(auth_user instanceof NextResponse){
            return auth_user;
        }

        const location_id = body.id?.trim();
        const name = body.name?.trim();

        if(!location_id){
            return NextResponse.json({error: "id is required"}, {status: 400});
        }
        if(!name){
            return NextResponse.json({error: "name is required"}, {status: 400});
        }

        try{
            const location = await locations_repository.update_location(
                auth_user.id,
                location_id,
                name,
            );

            return NextResponse.json(location);
        }catch(error){
            if(error instanceof LocationForbiddenError){
                return NextResponse.json({error: error.message}, {status: 403});
            }
            if(error instanceof LocationNotFoundError){
                return NextResponse.json({error: error.message}, {status: 404});
            }
            if(error instanceof ValidationError){
                return NextResponse.json({error: error.message}, {status: 400});
            }
            if(error instanceof Error){
                console.error(error);
            }
            return NextResponse.json(
                {error: "Internal server error"},
                {status: 500}
            )
        }
    },

    // Delete a location
    async delete_location(id: string){
        const auth_user = await requireAuthUser();

        if(auth_user instanceof NextResponse){
            return auth_user;
        }

        const location_id = id.trim();

        if(!location_id){
            return NextResponse.json({error: "id is required"}, {status: 400});
        }

        try{
            const location = await locations_repository.delete_location(
                auth_user.id,
                location_id,
            );

            return NextResponse.json(location);
        }catch(error){
            if(error instanceof LocationForbiddenError){
                return NextResponse.json({error: error.message}, {status: 403});
            }
            if(error instanceof LocationNotFoundError){
                return NextResponse.json({error: error.message}, {status: 404});
            }
            if(error instanceof ValidationError){
                return NextResponse.json({error: error.message}, {status: 400});
            }
            if(error instanceof Error){
                console.error(error);
            }
            return NextResponse.json(
                {error: "Internal server error"},
                {status: 500}
            )
        }
    }
}
