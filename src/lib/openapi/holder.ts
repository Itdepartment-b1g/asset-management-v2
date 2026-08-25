export const holderPaths = {
  "/api/holder": {
    get: {
      tags: ["holder"],
      summary: "List shared pools or get one shared pool",
      description:
        "Returns a paginated list of shared pools when `id` is omitted. Pass `id` to fetch a single shared pool. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "Shared pool ID (optional — omit to list all)",
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
          description: "Case-insensitive search against shared pool name.",
        },
      ],
      responses: {
        "200": {
          description: "Shared pool or paginated shared pool list",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/Holder" },
                  { $ref: "#/components/schemas/PaginatedHolders" },
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
          description: "Shared pool not found",
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
      tags: ["holder"],
      summary: "Create a shared pool",
      description:
        "Creates a shared pool label (e.g. Universal, Warehouse). Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateHolderBody" },
          },
        },
      },
      responses: {
        "201": {
          description: "Shared pool created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Holder" },
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
    patch: {
      tags: ["holder"],
      summary: "Update a shared pool",
      description:
        "Updates an existing shared pool's name. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateHolderBody" },
          },
        },
      },
      responses: {
        "200": {
          description: "Shared pool updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Holder" },
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
          description: "Shared pool not found",
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
      tags: ["holder"],
      summary: "Delete a shared pool",
      description:
        "Deletes a shared pool by id. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Shared pool ID to delete",
        },
      ],
      responses: {
        "200": {
          description: "Shared pool deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Holder" },
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
          description: "Shared pool not found",
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

export const holderSchemas = {
  Holder: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Universal" },
      created_by_id: { type: "string", format: "uuid", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "created_by_id", "created_at", "updated_at"],
  },
  CreateHolderBody: {
    type: "object",
    properties: {
      name: { type: "string", example: "Universal" },
    },
    required: ["name"],
  },
  UpdateHolderBody: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Warehouse (S)" },
    },
    required: ["id", "name"],
  },
  PaginatedHolders: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Holder" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
    required: ["data", "meta"],
  },
};
