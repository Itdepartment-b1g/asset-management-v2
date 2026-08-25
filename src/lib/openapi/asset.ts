export const assetPaths = {
  "/api/asset": {
    get: {
      tags: ["asset"],
      summary: "List assets or get one asset",
      description:
        "Returns a paginated table summary when `id` is omitted (code, name, condition, status, holder, department, location, and legend). Pass `id` to fetch the full asset, including serial, vendor, cost, remarks, transfer history, and photo metadata. Photo blobs are omitted; use `/api/asset-photo`. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "Asset ID (optional — omit to list all)",
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        },
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description:
            "Case-insensitive search against asset name, code name, or serial number.",
        },
      ],
      responses: {
        "200": {
          description: "Full asset when `id` is set, or paginated table summary",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/Asset" },
                  { $ref: "#/components/schemas/PaginatedAssets" },
                ],
              },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Asset not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    post: {
      tags: ["asset"],
      summary: "Create an asset",
      description:
        "Creates an asset. `code_name` is generated as `B1G-ASSET-YYYYMM-0001`. Optional warranty and receipt photos are stored in Postgres. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateAssetBody" },
          },
        },
      },
      responses: {
        "201": {
          description: "Asset created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Asset" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["asset"],
      summary: "Delete an asset",
      description:
        "Deletes an asset and its photos. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Asset ID to delete",
        },
      ],
      responses: {
        "200": {
          description: "Asset deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Asset" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Asset not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
  "/api/asset-photo": {
    get: {
      tags: ["asset"],
      summary: "Get an asset photo",
      description:
        "Returns the stored image bytes. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Asset photo ID",
        },
        {
          name: "download",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["1", "true"] },
          description:
            "When set, the photo is returned as an attachment for download.",
        },
      ],
      responses: {
        "200": {
          description: "Image bytes",
          content: {
            "image/jpeg": { schema: { type: "string", format: "binary" } },
            "image/png": { schema: { type: "string", format: "binary" } },
            "image/webp": { schema: { type: "string", format: "binary" } },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Photo not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
  "/api/asset-transfer": {
    post: {
      tags: ["asset"],
      summary: "Transfer an asset",
      description:
        "Reassigns an asset to another user and records the previous holder in transfer history. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TransferAssetBody" },
          },
        },
      },
      responses: {
        "200": {
          description: "Asset transferred",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Asset" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Asset not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
};

export const assetSchemas = {
  AssetStatus: {
    type: "string",
    enum: ["active", "inactive", "stored"],
  },
  AssetPhotoKind: {
    type: "string",
    enum: ["warranty", "receipt"],
  },
  AssetPhotoMeta: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      kind: { $ref: "#/components/schemas/AssetPhotoKind" },
      file_name: { type: "string" },
      mime_type: { type: "string" },
      byte_size: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
    },
    required: ["id", "kind", "file_name", "mime_type", "byte_size", "created_at"],
  },
  AssetLookup: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
    },
    required: ["id", "name"],
  },
  AssetLegend: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      color: { type: "string" },
    },
    required: ["id", "name", "color"],
  },
  AssetUserPreview: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      full_name: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      department: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
    },
    required: ["id"],
  },
  AssetTransfer: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      from_user_id: { type: "string", format: "uuid", nullable: true },
      to_user_id: { type: "string", format: "uuid" },
      remarks: { type: "string", nullable: true },
      transferred_by_id: { type: "string", format: "uuid" },
      transferred_at: { type: "string", format: "date-time" },
      from_user: {
        allOf: [{ $ref: "#/components/schemas/AssetUserPreview" }],
        nullable: true,
      },
      to_user: { $ref: "#/components/schemas/AssetUserPreview" },
      transferred_by: { $ref: "#/components/schemas/AssetUserPreview" },
    },
    required: [
      "id",
      "to_user_id",
      "transferred_by_id",
      "transferred_at",
      "to_user",
      "transferred_by",
    ],
  },
  Asset: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      asset_name: { type: "string" },
      code_name: { type: "string", example: "B1G-ASSET-202608-0001" },
      serial_number: { type: "string", nullable: true },
      purchase_date: { type: "string", format: "date-time", nullable: true },
      current_condition: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      condition_assignment: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      status: {
        allOf: [{ $ref: "#/components/schemas/AssetStatus" }],
        nullable: true,
      },
      remarks: { type: "string", nullable: true },
      vendor_name: { type: "string", nullable: true },
      cost_value: { type: "number", nullable: true },
      salvage_value: { type: "number", nullable: true },
      warranty_end_date: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      useful_life_end_date: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      original_issue_date: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      currently_issued_to_id: { type: "string", format: "uuid", nullable: true },
      created_by_id: { type: "string", format: "uuid", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      department: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      location: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      legend: {
        allOf: [{ $ref: "#/components/schemas/AssetLegend" }],
        nullable: true,
      },
      currently_issued_to: {
        allOf: [{ $ref: "#/components/schemas/AssetUserPreview" }],
        nullable: true,
      },
      created_by: {
        allOf: [{ $ref: "#/components/schemas/AssetUserPreview" }],
        nullable: true,
      },
      photos: {
        type: "array",
        items: { $ref: "#/components/schemas/AssetPhotoMeta" },
      },
      transfers: {
        type: "array",
        items: { $ref: "#/components/schemas/AssetTransfer" },
      },
    },
    required: ["id", "asset_name", "code_name", "created_at", "updated_at"],
  },
  AssetListItem: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      asset_name: { type: "string" },
      code_name: { type: "string", example: "B1G-ASSET-202608-0001" },
      current_condition: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      status: {
        allOf: [{ $ref: "#/components/schemas/AssetStatus" }],
        nullable: true,
      },
      currently_issued_to_id: { type: "string", format: "uuid", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      department: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      location: {
        allOf: [{ $ref: "#/components/schemas/AssetLookup" }],
        nullable: true,
      },
      legend: {
        allOf: [{ $ref: "#/components/schemas/AssetLegend" }],
        nullable: true,
      },
      currently_issued_to: {
        allOf: [{ $ref: "#/components/schemas/AssetUserPreview" }],
        nullable: true,
      },
    },
    required: ["id", "asset_name", "code_name", "created_at", "updated_at"],
  },
  CreateAssetBody: {
    type: "object",
    properties: {
      asset_name: { type: "string" },
      serial_number: { type: "string" },
      purchase_date: { type: "string", format: "date" },
      current_condition_id: { type: "string", format: "uuid" },
      condition_assignment_id: { type: "string", format: "uuid" },
      status: { $ref: "#/components/schemas/AssetStatus" },
      remarks: { type: "string" },
      vendor_name: { type: "string" },
      cost_value: { type: "number" },
      salvage_value: { type: "number" },
      warranty_end_date: { type: "string", format: "date", nullable: true },
      useful_life_end_date: { type: "string", format: "date", nullable: true },
      original_issue_date: { type: "string", format: "date", nullable: true },
      currently_issued_to_id: { type: "string", format: "uuid", nullable: true },
      department_id: { type: "string", format: "uuid" },
      location_id: { type: "string", format: "uuid" },
      legend_id: { type: "string", format: "uuid" },
      warranty_photo: { type: "string", format: "binary", nullable: true },
      receipt_photo: { type: "string", format: "binary", nullable: true },
    },
    required: [
      "asset_name",
      "current_condition_id",
      "condition_assignment_id",
      "status",
    ],
  },
  TransferAssetBody: {
    type: "object",
    properties: {
      asset_id: { type: "string", format: "uuid" },
      to_user_id: { type: "string", format: "uuid" },
      remarks: { type: "string" },
    },
    required: ["asset_id", "to_user_id"],
  },
  PaginatedAssets: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/AssetListItem" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
    required: ["data", "meta"],
  },
};
