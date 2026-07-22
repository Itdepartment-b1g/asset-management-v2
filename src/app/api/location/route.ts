import "server-only";
import { NextResponse } from "next/server";
import { locations_controller } from "@/server/controllers/locations_controller";

type LocationBody = {
    name?: string;
}

type UpdateLocationBody = LocationBody & {
    id?: string;
}

// GET /api/location
// GET /api/location?id=<location_id>
export async function GET(request: Request){
    const id = new URL(request.url).searchParams.get("id");
    if(id !== null){
        return locations_controller.find_location_by_id(id);
    }
    return locations_controller.list_locations(request);
}

// POST /api/location
export async function POST(request: Request){
    try{
        const body = (await request.json()) as LocationBody;
        if(!body || typeof body !== "object" || Array.isArray(body)){
            return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
        }
        return locations_controller.create_location(body);
    }catch{
        return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
    }
}

// PATCH /api/location
export async function PATCH(request: Request){
    try{
        const body = (await request.json()) as UpdateLocationBody;

        if(!body || typeof body !== "object" || Array.isArray(body)){
            return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
        }
        return locations_controller.update_location(body);
    }catch{
        return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
    }
}

// DELETE /api/location?id=<location_id>
export async function DELETE(request: Request){
    const id = new URL(request.url).searchParams.get("id");
    if(id === null){
        return NextResponse.json({error: "id is required"}, {status: 400});
    }
    return locations_controller.delete_location(id);
}