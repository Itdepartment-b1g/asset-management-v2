export const info = {
  title: "Next.js + Supabase API",
  version: "1.0.0",
  description:
    "Auth and user profile APIs backed by Supabase Auth. Sign in with `POST /api/auth/login`, create users with `POST /api/auth/create-user`, and update profiles with `PATCH /api/auth/update-user`.",
};

export const servers = [
  {
    url: "http://localhost:3000",
    description: "Local development",
  },
];

export const tags = [
  {
    name: "auth",
    description: "Sign in and manage user profiles",
  },
  {
    name: "legend",
    description: "Manage asset legends",
  },
];

export const securitySchemes = {
  sessionCookie: {
    type: "apiKey",
    in: "cookie",
    name: "Cookie",
    description:
      "Supabase Auth session cookie returned by `POST /api/auth/login`. In Swagger UI, sign in first so the browser stores the cookie for this origin.",
  },
};

export const sharedSchemas = {
  Error: {
    type: "object",
    properties: {
      error: { type: "string" },
    },
    required: ["error"],
  },
};
