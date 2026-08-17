export const conditionPaths = {
    "/api/condition": {
      get: {
        tags: ["condition"],
        summary: "List conditions or get one condition",
        description:
          "Returns a paginated list of conditions when `id` is omitted. Pass `id` to fetch a single condition. Restricted to super_admin and admin.",
        security: [{ sessionCookie: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "Condition ID (optional — omit to list all)",
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
            description: "Condition or paginated condition list",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/Condition" },
                    { $ref: "#/components/schemas/PaginatedConditions" },
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
            description: "Department not found",
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
        tags: ["condition"],
        summary: "Create a condition",
        description: "Creates a condition. Restricted to super_admin and admin.",
        security: [{ sessionCookie: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateConditionBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Condition created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Condition" },
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
        tags: ["condition"],
        summary: "Update a condition",
        description:
          "Updates an existing condition's name. Restricted to super_admin and admin.",
        security: [{ sessionCookie: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateConditionBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Condition updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Condition" },
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
            description: "Condition not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Internal test server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["condition"],
        summary: "Delete a condition",
        description:
          "Deletes a condition by id. Restricted to super_admin and admin.",
        security: [{ sessionCookie: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Condition ID to delete",
          },
        ],
        responses: {
          "200": {
            description: "Condition deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Condition" },
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
            description: "Condition not found",
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
  
  export const conditionSchemas = {
    Condition: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", example: "Condition A" },
        created_by_id: { type: "string", format: "uuid", nullable: true },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
      required: ["id", "name", "created_by_id", "created_at", "updated_at"],
    },
    CreateConditionBody: {
      type: "object",
      properties: {
        name: { type: "string", example: "Condition A" },
      },
      required: ["name"],
    },
    UpdateConditionBody: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", example: "Condition A" },
      },
      required: ["id", "name"],
    },
    PaginatedConditions: {
      type: "object",
      properties: {
        data: {
          type: "array",
            items: { $ref: "#/components/schemas/Condition" },
        },
        meta: { $ref: "#/components/schemas/PaginationMeta" },
      },
      required: ["data", "meta"],
    },
  };
  