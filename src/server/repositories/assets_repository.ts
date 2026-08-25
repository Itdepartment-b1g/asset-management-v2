import "server-only";

import { prisma } from "@/server/prisma/client";
import {
  paginated_query,
  parse_pagination,
  type PaginationInput,
} from "@/server/lib/pagination";

const privileged_roles = new Set(["super_admin", "admin"]);

const ASSET_STATUSES = ["active", "inactive", "stored"] as const;
const PHOTO_KINDS = ["warranty", "receipt"] as const;
const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type AssetPhotoKind = (typeof PHOTO_KINDS)[number];

export type AssetPhotoInput = {
  kind: AssetPhotoKind;
  file_name: string;
  mime_type: string;
  byte_size: number;
  data: Uint8Array;
};

export type CreateAssetInput = {
  asset_name: string;
  serial_number?: string | null;
  purchase_date?: Date | null;
  current_condition_id: string;
  condition_assignment_id: string;
  status: AssetStatus;
  remarks?: string | null;
  vendor_name?: string | null;
  cost_value?: number | null;
  salvage_value?: number | null;
  warranty_end_date?: Date | null;
  useful_life_end_date?: Date | null;
  original_issue_date?: Date | null;
  currently_issued_to_id?: string | null;
  location_id?: string | null;
  legend_id?: string | null;
  photos?: AssetPhotoInput[];
};

export type TransferAssetInput = {
  to_user_id: string;
  remarks?: string | null;
};

export class AssetForbiddenError extends Error {
  constructor() {
    super("You are not allowed to manage assets");
    this.name = "AssetForbiddenError";
  }
}

export class AssetNotFoundError extends Error {
  constructor() {
    super("Asset not found");
    this.name = "AssetNotFoundError";
  }
}

export class AssetPhotoNotFoundError extends Error {
  constructor() {
    super("Asset photo not found");
    this.name = "AssetPhotoNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const user_preview_select = {
  id: true,
  full_name: true,
  email: true,
} as const;

const issued_to_select = {
  id: true,
  full_name: true,
  email: true,
  department: { select: { id: true, name: true } },
} as const;

const asset_table_select = {
  id: true,
  asset_name: true,
  code_name: true,
  current_condition: { select: { id: true, name: true } },
  status: true,
  currently_issued_to_id: true,
  created_at: true,
  updated_at: true,
  department: { select: { id: true, name: true } },
  location: { select: { id: true, name: true } },
  legend: { select: { id: true, name: true, color: true } },
  currently_issued_to: {
    select: issued_to_select,
  },
} as const;

const asset_detail_include = {
  current_condition: { select: { id: true, name: true } },
  condition_assignment: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  location: { select: { id: true, name: true } },
  legend: { select: { id: true, name: true, color: true } },
  currently_issued_to: {
    select: issued_to_select,
  },
  created_by: {
    select: user_preview_select,
  },
  photos: {
    select: {
      id: true,
      kind: true,
      file_name: true,
      mime_type: true,
      byte_size: true,
      created_at: true,
    },
  },
  transfers: {
    orderBy: { transferred_at: "desc" as const },
    include: {
      from_user: { select: user_preview_select },
      to_user: { select: user_preview_select },
      transferred_by: { select: user_preview_select },
    },
  },
} as const;

async function assert_privileged_actor(actor_id: string) {
  const actor = await prisma.user.findUnique({ where: { id: actor_id } });
  if (!actor?.role || !privileged_roles.has(actor.role)) {
    throw new AssetForbiddenError();
  }
  return actor;
}

export function is_asset_status(value: string): value is AssetStatus {
  return (ASSET_STATUSES as readonly string[]).includes(value);
}

export function is_photo_kind(value: string): value is AssetPhotoKind {
  return (PHOTO_KINDS as readonly string[]).includes(value);
}

function validate_asset_name(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 255) {
    throw new ValidationError("Asset name must be between 2 and 255 characters");
  }
  return trimmed;
}

function validate_optional_text(value: string | null | undefined, label: string) {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) {
    throw new ValidationError(`${label} must be 2000 characters or fewer`);
  }
  return trimmed;
}

function current_code_prefix(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `B1G-ASSET-${year}${month}-`;
}

async function next_asset_code_name(tx: {
  asset_information: {
    findFirst: (args: {
      where: { code_name: { startsWith: string } };
      orderBy: { code_name: "desc" };
      select: { code_name: true };
    }) => Promise<{ code_name: string } | null>;
  };
}) {
  const prefix = current_code_prefix();
  const latest = await tx.asset_information.findFirst({
    where: { code_name: { startsWith: prefix } },
    orderBy: { code_name: "desc" },
    select: { code_name: true },
  });

  const last_sequence = latest
    ? Number.parseInt(latest.code_name.slice(prefix.length), 10)
    : 0;
  const next_sequence = Number.isFinite(last_sequence) ? last_sequence + 1 : 1;

  return `${prefix}${String(next_sequence).padStart(4, "0")}`;
}

function is_code_name_conflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export function validate_photo_file(input: {
  kind: AssetPhotoKind;
  file_name: string;
  mime_type: string;
  byte_size: number;
  data: Uint8Array;
}): AssetPhotoInput {
  if (!ALLOWED_PHOTO_MIME_TYPES.has(input.mime_type.toLowerCase())) {
    throw new ValidationError(
      `${input.kind} photo must be a JPEG, PNG, or WebP image`,
    );
  }

  if (input.byte_size <= 0 || input.byte_size > MAX_PHOTO_BYTES) {
    throw new ValidationError(
      `${input.kind} photo must be 2 MB or smaller`,
    );
  }

  if (input.data.byteLength !== input.byte_size) {
    throw new ValidationError(`${input.kind} photo is corrupted or incomplete`);
  }

  const file_name = input.file_name.trim().slice(0, 255) || `${input.kind}.jpg`;

  return {
    kind: input.kind,
    file_name,
    mime_type: input.mime_type.toLowerCase() === "image/jpg" ? "image/jpeg" : input.mime_type,
    byte_size: input.byte_size,
    data: input.data,
  };
}

async function assert_optional_relations(input: CreateAssetInput) {
  if (!input.current_condition_id?.trim()) {
    throw new ValidationError("Current condition is required");
  }
  const current_condition = await prisma.conditions.findUnique({
    where: { id: input.current_condition_id },
    select: { id: true },
  });
  if (!current_condition) {
    throw new ValidationError("Current condition not found");
  }

  if (!input.condition_assignment_id?.trim()) {
    throw new ValidationError("Condition assignment is required");
  }
  const condition_assignment = await prisma.conditions.findUnique({
    where: { id: input.condition_assignment_id },
    select: { id: true },
  });
  if (!condition_assignment) {
    throw new ValidationError("Condition assignment not found");
  }

  if (input.location_id) {
    const location = await prisma.locations.findUnique({
      where: { id: input.location_id },
      select: { id: true },
    });
    if (!location) {
      throw new ValidationError("Location not found");
    }
  }

  if (input.currently_issued_to_id) {
    const user = await prisma.user.findUnique({
      where: { id: input.currently_issued_to_id },
      select: { id: true },
    });
    if (!user) {
      throw new ValidationError("Issued-to user not found");
    }
  }

  if (input.legend_id) {
    const legend = await prisma.legend.findUnique({
      where: { id: input.legend_id },
      select: { id: true },
    });
    if (!legend) {
      throw new ValidationError("Legend not found");
    }
  }
}

export const assets_repository = {
  async list_assets(
    actor_id: string,
    input?: PaginationInput & { search?: string; status?: AssetStatus },
  ) {
    await assert_privileged_actor(actor_id);
    const { page, limit, skip, take } = parse_pagination(input);
    const search = input?.search?.trim();
    const status = input?.status;
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                asset_name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                code_name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                serial_number: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    return paginated_query({
      page,
      limit,
      skip,
      take,
      count: () => prisma.asset_information.count({ where }),
      find_many: ({ skip, take }) =>
        prisma.asset_information.findMany({
          where,
          select: asset_table_select,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
    });
  },

  async find_by_id(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);
    const asset = await prisma.asset_information.findUnique({
      where: { id },
      include: asset_detail_include,
    });
    if (!asset) {
      throw new AssetNotFoundError();
    }
    return asset;
  },

  async find_photo_by_id(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);
    const photo = await prisma.asset_photo.findUnique({
      where: { id },
    });
    if (!photo) {
      throw new AssetPhotoNotFoundError();
    }
    return photo;
  },

  async create_asset(actor_id: string, input: CreateAssetInput) {
    await assert_privileged_actor(actor_id);

    const asset_name = validate_asset_name(input.asset_name);
    if (!is_asset_status(input.status)) {
      throw new ValidationError("Status must be active, inactive, or stored");
    }

    const photos = (input.photos ?? []).map((photo) =>
      validate_photo_file(photo),
    );
    const kinds = new Set(photos.map((photo) => photo.kind));
    if (kinds.size !== photos.length) {
      throw new ValidationError("Each photo kind can only be uploaded once");
    }

    await assert_optional_relations(input);

    const serial_number = validate_optional_text(
      input.serial_number,
      "Serial number",
    );
    const remarks = validate_optional_text(input.remarks, "Remarks");
    const vendor_name = validate_optional_text(input.vendor_name, "Vendor name");

    const currently_issued_to_id = input.currently_issued_to_id ?? null;
    const optional_fields = {
      warranty_end_date: input.warranty_end_date ?? null,
      useful_life_end_date: input.useful_life_end_date ?? null,
      original_issue_date: input.original_issue_date ?? null,
      currently_issued_to_id,
      originally_issued_to: currently_issued_to_id
        ? { connect: { id: currently_issued_to_id } }
        : undefined,
      transfers: currently_issued_to_id
        ? {
            create: {
              to_user_id: currently_issued_to_id,
              remarks: "Initial assignment",
              transferred_by_id: actor_id,
            },
          }
        : undefined,
      photos:
        photos.length > 0
          ? {
              create: photos.map((photo) => ({
                kind: photo.kind,
                file_name: photo.file_name,
                mime_type: photo.mime_type,
                byte_size: photo.byte_size,
                data: Buffer.from(photo.data),
              })),
            }
          : undefined,
    };

    const max_attempts = 5;
    for (let attempt = 0; attempt < max_attempts; attempt += 1) {
      try {
        return await prisma.$transaction(async (tx) => {
          const code_name = await next_asset_code_name(tx);
          return tx.asset_information.create({
            data: {
              asset_name,
              code_name,
              serial_number,
              purchase_date: input.purchase_date ?? null,
              current_condition_id: input.current_condition_id,
              condition_assignment_id: input.condition_assignment_id,
              status: input.status,
              remarks,
              vendor_name,
              cost_value: input.cost_value ?? null,
              salvage_value: input.salvage_value ?? null,
              created_by_id: actor_id,
              location_id: input.location_id ?? null,
              legend_id: input.legend_id ?? null,
              ...optional_fields,
            },
            include: asset_detail_include,
          });
        });
      } catch (error) {
        if (is_code_name_conflict(error) && attempt < max_attempts - 1) {
          continue;
        }
        throw error;
      }
    }

    throw new ValidationError("Could not generate a unique asset code");
  },

  async delete_asset(actor_id: string, id: string) {
    await assert_privileged_actor(actor_id);
    const asset = await prisma.asset_information.findUnique({
      where: { id },
      include: asset_detail_include,
    });
    if (!asset) {
      throw new AssetNotFoundError();
    }
    await prisma.asset_information.delete({ where: { id } });
    return asset;
  },

  async transfer_asset(
    actor_id: string,
    asset_id: string,
    input: TransferAssetInput,
  ) {
    await assert_privileged_actor(actor_id);

    const to_user_id = input.to_user_id.trim();
    if (!to_user_id) {
      throw new ValidationError("to_user_id is required");
    }

    const remarks = validate_optional_text(input.remarks, "Remarks");

    const to_user = await prisma.user.findUnique({
      where: { id: to_user_id },
      select: { id: true },
    });
    if (!to_user) {
      throw new ValidationError("Transfer recipient not found");
    }

    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset_information.findUnique({
        where: { id: asset_id },
        include: {
          originally_issued_to: { select: { id: true } },
        },
      });
      if (!asset) {
        throw new AssetNotFoundError();
      }
      if (asset.currently_issued_to_id === to_user_id) {
        throw new ValidationError("Asset is already issued to this user");
      }

      await tx.asset_transfer.create({
        data: {
          asset_id,
          from_user_id: asset.currently_issued_to_id,
          to_user_id,
          remarks,
          transferred_by_id: actor_id,
        },
      });

      return tx.asset_information.update({
        where: { id: asset_id },
        data: {
          currently_issued_to_id: to_user_id,
          original_issue_date: asset.original_issue_date ?? new Date(),
          originally_issued_to:
            asset.originally_issued_to.length === 0
              ? { connect: { id: to_user_id } }
              : undefined,
        },
        include: asset_detail_include,
      });
    });
  },
};
