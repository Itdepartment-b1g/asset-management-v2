export const legendPaths = {
  "/api/legend": {
    get: {
      tags: ["legend"],
      summary: "List legends or get one legend",
      description:
        "Returns a paginated list of legends when `id` is omitted. Pass `id` to fetch a single legend. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "Legend ID (optional — omit to list all)",
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
          description: "Legend or paginated legend list",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/Legend" },
                  { $ref: "#/components/schemas/PaginatedLegends" },
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
          description: "Legend not found",
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
      tags: ["legend"],
      summary: "Create a legend",
      description: "Creates a legend. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateLegendBody" },
          },
        },
      },
      responses: {
        "201": {
          description: "Legend created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Legend" },
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
      tags: ["legend"],
      summary: "Update a legend",
      description:
        "Updates an existing legend's name and color. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateLegendBody" },
          },
        },
      },
      responses: {
        "200": {
          description: "Legend updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Legend" },
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
          description: "Legend not found",
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
      tags: ["legend"],
      summary: "Delete a legend",
      description: "Deletes a legend by id. Restricted to super_admin and admin.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Legend ID to delete",
        },
      ],
      responses: {
        "200": {
          description: "Legend deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Legend" },
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
          description: "Legend not found",
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

export const legendSchemas = {
  Legend: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "In Use" },
      color: { type: "string", example: "#22c55e" },
      created_by_id: { type: "string", format: "uuid", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
    required: [
      "id",
      "name",
      "color",
      "created_by_id",
      "created_at",
      "updated_at",
    ],
  },
  CreateLegendBody: {
    type: "object",
    properties: {
      name: { type: "string", example: "In Use" },
      color: { type: "string", example: "#22c55e" },
    },
    required: ["name", "color"],
  },
  UpdateLegendBody: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "In Use" },
      color: { type: "string", example: "#22c55e" },
    },
    required: ["id", "name", "color"],
  },
  PaginatedLegends: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Legend" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
    required: ["data", "meta"],
  },
};
