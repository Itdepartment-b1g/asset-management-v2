const userResponse = {
  "200": {
    description: "Profile updated",
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
    description: "User not found",
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
};

export const authPaths = {
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
              schema: { $ref: "#/components/schemas/LoginResponse" },
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
        "404": {
          description: "User profile not found",
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
  "/api/auth/create-user": {
    post: {
      tags: ["auth"],
      summary: "Create a user",
      description:
        "Creates a Supabase auth user and matching profile. super_admin can create super_admin, admin, or employee. admin can create employee only.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateUserBody" },
          },
        },
      },
      responses: {
        "201": {
          description: "User created",
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
  },
  "/api/auth/users": {
    get: {
      tags: ["auth"],
      summary: "List users or get one user",
      description:
        "Returns a paginated list of users when `id` is omitted. Pass `id` to fetch a single user. super_admin can access all users. admin can only access employees.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "User ID (optional — omit to list all)",
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
          name: "role",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["super_admin", "admin", "employee"],
          },
          description: "Filter by role when listing users (super_admin only).",
        },
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Case-insensitive search against full name and email.",
        },
        {
          name: "department_id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          description:
            "When set, list and search are limited to users in this department.",
        },
      ],
      responses: {
        "200": {
          description: "User or paginated user list",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/User" },
                  { $ref: "#/components/schemas/PaginatedUsers" },
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
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "User not found",
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
  "/api/auth/update-user": {
    patch: {
      tags: ["auth"],
      summary: "Update a user profile",
      description:
        "Updates an existing profile. Omit `id` to update the signed-in user (full_name, password). super_admin can pass `id` to update another user's email, full_name, role, or password.",
      security: [{ sessionCookie: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateUserBody" },
          },
        },
      },
      responses: userResponse,
    },
  },
};

export const authSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email", nullable: true },
      full_name: { type: "string", nullable: true },
      role: {
        type: "string",
        nullable: true,
        enum: ["super_admin", "admin", "employee"],
      },
      department_id: { type: "string", format: "uuid", nullable: true },
      department: {
        nullable: true,
        allOf: [{ $ref: "#/components/schemas/UserDepartment" }],
      },
      created_by_id: { type: "string", format: "uuid", nullable: true },
      created_by: {
        nullable: true,
        allOf: [{ $ref: "#/components/schemas/UserCreatedBy" }],
      },
    },
    required: [
      "id",
      "email",
      "full_name",
      "role",
      "department_id",
      "department",
      "created_by_id",
      "created_by",
    ],
  },
  UserDepartment: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
    },
    required: ["id", "name"],
  },
  UserCreatedBy: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      full_name: { type: "string", nullable: true },
      email: { type: "string", format: "email", nullable: true },
    },
    required: ["id", "full_name", "email"],
  },
  LoginResponse: {
    allOf: [
      { $ref: "#/components/schemas/User" },
      {
        type: "object",
        properties: {
          access_token: {
            type: "string",
            description: "Supabase JWT for `Authorization: Bearer` requests.",
          },
        },
        required: ["access_token"],
      },
    ],
  },
  LoginBody: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "super_admin@gmail.com",
      },
      password: {
        type: "string",
        minLength: 6,
        example: "tempPassword123!",
      },
    },
    required: ["email", "password"],
  },
  CreateUserBody: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "employee@company.com",
      },
      password: {
        type: "string",
        minLength: 6,
        example: "tempPassword123!",
      },
      full_name: {
        type: "string",
        nullable: true,
        example: "Jane Employee",
      },
      role: {
        type: "string",
        enum: ["super_admin", "admin", "employee"],
        example: "employee",
      },
      department_id: {
        type: "string",
        format: "uuid",
        example: "11111111-1111-1111-1111-111111111111",
      },
    },
    required: ["email", "password", "role", "department_id"],
  },
  UpdateUserBody: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Target user id. Omit to update the signed-in user.",
      },
      email: {
        type: "string",
        format: "email",
        nullable: true,
        example: "employee@company.com",
      },
      full_name: {
        type: "string",
        nullable: true,
        example: "Jane Employee",
      },
      role: {
        type: "string",
        enum: ["super_admin", "admin", "employee"],
      },
      department_id: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      password: {
        type: "string",
        minLength: 6,
        example: "newPassword123!",
      },
    },
  },
  PaginationMeta: {
    type: "object",
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 10 },
      total: { type: "integer", example: 25 },
      total_pages: { type: "integer", example: 3 },
      has_next_page: { type: "boolean", example: true },
      has_prev_page: { type: "boolean", example: false },
    },
    required: [
      "page",
      "limit",
      "total",
      "total_pages",
      "has_next_page",
      "has_prev_page",
    ],
  },
  PaginatedUsers: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/User" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
    required: ["data", "meta"],
  },
};
