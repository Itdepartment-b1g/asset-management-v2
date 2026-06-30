export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Asset Management API",
    version: "1.0.0",
    description:
      "Practice API for categories CRUD. Uses query param `id` for get-one and delete.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    {
      name: "categories",
      description: "Category management",
    },
  ],
  paths: {
    "/api/categories": {
      get: {
        tags: ["categories"],
        summary: "List all categories",
        description:
          "Returns all categories. Pass `id` query param to fetch a single category.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "Category ID (optional — omit to list all)",
          },
        ],
        responses: {
          "200": {
            description: "List of categories or a single category",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                    { $ref: "#/components/schemas/Category" },
                  ],
                },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        tags: ["categories"],
        summary: "Create a category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategoryBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
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
        },
      },
      patch: {
        tags: ["categories"],
        summary: "Update a category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCategoryBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Category updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
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
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["categories"],
        summary: "Delete a category",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Category ID to delete",
          },
        ],
        responses: {
          "200": {
            description: "Category deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteSuccess" },
              },
            },
          },
          "400": {
            description: "Missing id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
        required: ["id", "title", "created_at", "updated_at"],
      },
      CreateCategoryBody: {
        type: "object",
        properties: {
          title: { type: "string", example: "Laptops" },
        },
        required: ["title"],
      },
      UpdateCategoryBody: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          title: { type: "string", example: "Updated title" },
        },
        required: ["id", "title"],
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      DeleteSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
        },
        required: ["success"],
      },
    },
  },
} as const;
