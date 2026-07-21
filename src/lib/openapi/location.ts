export const locationPaths = {
  "/api/location": {
    get: {
      tags: ["location"],
      summary: "List locations or get one location",
      description:
        "Returns a paginated list of locations when `id` is omitted. Pass `id` to fetch a single location. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "Location ID (optional — omit to list all)",
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
      ],
      responses: {
        "200": {
          description: "Location or paginated location list",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/Location" },
                  { $ref: "#/components/schemas/PaginatedLocations" },
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
          description: "Location not found",
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
      tags: ["location"],
      summary: "Create a location",
      description: "Creates a location. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateLocationBody" },
          },
        },
      },
      responses: {
        "201": {
          description: "Location created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Location" },
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
      tags: ["location"],
      summary: "Update a location",
      description:
        "Updates an existing location's name. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateLocationBody" },
          },
        },
      },
      responses: {
        "200": {
          description: "Location updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Location" },
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
          description: "Location not found",
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
      tags: ["location"],
      summary: "Delete a location",
      description:
        "Deletes a location by id. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Location ID to delete",
        },
      ],
      responses: {
        "200": {
          description: "Location deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Location" },
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
          description: "Location not found",
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

export const locationSchemas = {
  Location: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Warehouse A" },
      created_by_id: { type: "string", format: "uuid", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "created_by_id", "created_at", "updated_at"],
  },
  CreateLocationBody: {
    type: "object",
    properties: {
      name: { type: "string", example: "Warehouse A" },
    },
    required: ["name"],
  },
  UpdateLocationBody: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Warehouse A" },
    },
    required: ["id", "name"],
  },
  PaginatedLocations: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Location" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
    required: ["data", "meta"],
  },
};
