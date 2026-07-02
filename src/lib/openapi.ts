export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Next.js + Supabase API",
    version: "1.0.0",
    description:
      "Starter API for Supabase Auth (login/signup) and per-user categories CRUD. Protected routes require a Supabase Auth session cookie set by `POST /api/auth/login` or `POST /api/auth/signup`.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    {
      name: "auth",
      description: "Sign up and sign in via Supabase Auth",
    },
    {
      name: "categories",
      description: "Per-user category management (authenticated users only)",
    },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["auth"],
        summary: "Sign in",
        description:
          "Sign in with email and password. On success, sets the session cookie used by protected routes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
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
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["auth"],
        summary: "Create account",
        description:
          "Create a new account with email and password. On success, sets the session cookie used by protected routes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created and signed in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
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
    },
    "/api/categories": {
      get: {
        tags: ["categories"],
        summary: "List categories for the current user",
        description:
          "Returns categories owned by the authenticated user. Pass `id` query param to fetch a single category.",
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
          "401": {
            description: "Not authenticated",
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
          "401": {
            description: "Not authenticated",
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
          "401": {
            description: "Not authenticated",
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
          "401": {
            description: "Not authenticated",
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
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email", nullable: true },
          full_name: { type: "string", nullable: true },
        },
        required: ["id", "email", "full_name"],
      },
      LoginBody: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "you@example.com" },
          password: {
            type: "string",
            minLength: 6,
            example: "secret123",
          },
        },
        required: ["email", "password"],
      },
      SignupBody: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "you@example.com" },
          password: {
            type: "string",
            minLength: 6,
            example: "secret123",
          },
          full_name: {
            type: "string",
            example: "Jane Doe",
          },
        },
        required: ["email", "password"],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          title: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
        required: ["id", "user_id", "title", "created_at", "updated_at"],
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
