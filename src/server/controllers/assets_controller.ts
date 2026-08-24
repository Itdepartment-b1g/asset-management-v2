import "server-only";

import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import {
  AssetForbiddenError,
  AssetNotFoundError,
  AssetPhotoNotFoundError,
  assets_repository,
  is_asset_status,
  validate_photo_file,
  ValidationError,
  type AssetPhotoInput,
  type AssetPhotoKind,
  type CreateAssetInput,
  type TransferAssetInput,
} from "@/server/repositories/assets_repository";

function form_string(form: FormData, key: string) {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parse_optional_date(value: string | undefined, label: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${label} is not a valid date`);
  }
  return date;
}

function parse_optional_number(value: string | undefined, label: string) {
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError(`${label} must be a number 0 or greater`);
  }
  return amount;
}

async function parse_photo(
  form: FormData,
  key: string,
  kind: AssetPhotoKind,
): Promise<AssetPhotoInput | null> {
  const value = form.get(key);
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  const data = new Uint8Array(await value.arrayBuffer());
  return validate_photo_file({
    kind,
    file_name: value.name,
    mime_type: value.type || "application/octet-stream",
    byte_size: value.size,
    data,
  });
}

async function parse_create_form(form: FormData): Promise<CreateAssetInput> {
  const asset_name = form_string(form, "asset_name");
  const current_condition_id = form_string(form, "current_condition_id");
  const condition_assignment_id = form_string(form, "condition_assignment_id");
  const status = form_string(form, "status");

  if (!asset_name) {
    throw new ValidationError("asset_name is required");
  }
  if (!current_condition_id) {
    throw new ValidationError("current_condition_id is required");
  }
  if (!condition_assignment_id) {
    throw new ValidationError("condition_assignment_id is required");
  }
  if (!status || !is_asset_status(status)) {
    throw new ValidationError("status must be active, inactive, or stored");
  }

  const photos: AssetPhotoInput[] = [];
  const warranty_photo = await parse_photo(form, "warranty_photo", "warranty");
  const receipt_photo = await parse_photo(form, "receipt_photo", "receipt");
  if (warranty_photo) photos.push(warranty_photo);
  if (receipt_photo) photos.push(receipt_photo);

  return {
    asset_name,
    serial_number: form_string(form, "serial_number") ?? null,
    purchase_date: parse_optional_date(
      form_string(form, "purchase_date"),
      "Purchase date",
    ),
    current_condition_id,
    condition_assignment_id,
    status,
    remarks: form_string(form, "remarks") ?? null,
    vendor_name: form_string(form, "vendor_name") ?? null,
    cost_value: parse_optional_number(
      form_string(form, "cost_value"),
      "Cost value",
    ),
    salvage_value: parse_optional_number(
      form_string(form, "salvage_value"),
      "Salvage value",
    ),
    warranty_end_date: parse_optional_date(
      form_string(form, "warranty_end_date"),
      "Warranty end date",
    ),
    useful_life_end_date: parse_optional_date(
      form_string(form, "useful_life_end_date"),
      "Useful life end date",
    ),
    original_issue_date: parse_optional_date(
      form_string(form, "original_issue_date"),
      "Original issue date",
    ),
    currently_issued_to_id: form_string(form, "currently_issued_to_id") ?? null,
    department_id: form_string(form, "department_id") ?? null,
    location_id: form_string(form, "location_id") ?? null,
    legend_id: form_string(form, "legend_id") ?? null,
    photos,
  };
}

function map_asset_error(error: unknown) {
  if (error instanceof AssetForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof AssetNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof AssetPhotoNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error) {
    console.error(error);
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export const assets_controller = {
  async list_assets(request: Request) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const { searchParams } = new URL(request.url);
    const page_param = searchParams.get("page");
    const limit_param = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || undefined;
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
      const result = await assets_repository.list_assets(auth_user.id, {
        page,
        limit,
        search,
      });
      return NextResponse.json(result);
    } catch (error) {
      return map_asset_error(error);
    }
  },

  async find_asset_by_id(id: string) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const asset_id = id.trim();
    if (!asset_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const asset = await assets_repository.find_by_id(auth_user.id, asset_id);
      return NextResponse.json(asset);
    } catch (error) {
      return map_asset_error(error);
    }
  },

  async create_asset(form: FormData) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    try {
      const input = await parse_create_form(form);
      const asset = await assets_repository.create_asset(auth_user.id, input);
      return NextResponse.json(asset, { status: 201 });
    } catch (error) {
      return map_asset_error(error);
    }
  },

  async delete_asset(id: string) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const asset_id = id.trim();
    if (!asset_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const asset = await assets_repository.delete_asset(
        auth_user.id,
        asset_id,
      );
      return NextResponse.json(asset);
    } catch (error) {
      return map_asset_error(error);
    }
  },

  async transfer_asset(body: {
    asset_id?: string;
    to_user_id?: string;
    remarks?: string | null;
  }) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const asset_id = body.asset_id?.trim();
    const to_user_id = body.to_user_id?.trim();
    if (!asset_id) {
      return NextResponse.json(
        { error: "asset_id is required" },
        { status: 400 },
      );
    }
    if (!to_user_id) {
      return NextResponse.json(
        { error: "to_user_id is required" },
        { status: 400 },
      );
    }

    const input: TransferAssetInput = {
      to_user_id,
      remarks: body.remarks ?? null,
    };

    try {
      const asset = await assets_repository.transfer_asset(
        auth_user.id,
        asset_id,
        input,
      );
      return NextResponse.json(asset);
    } catch (error) {
      return map_asset_error(error);
    }
  },

  async get_photo(id: string, download = false) {
    const auth_user = await requireAuthUser();
    if (auth_user instanceof NextResponse) {
      return auth_user;
    }

    const photo_id = id.trim();
    if (!photo_id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const photo = await assets_repository.find_photo_by_id(
        auth_user.id,
        photo_id,
      );
      const body = Buffer.from(photo.data);
      const safe_name = photo.file_name.replace(/[\r\n"]/g, "");
      const disposition = download ? "attachment" : "inline";

      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": photo.mime_type,
          "Content-Length": String(photo.byte_size),
          "Content-Disposition": `${disposition}; filename="${safe_name}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (error) {
      return map_asset_error(error);
    }
  },
};
