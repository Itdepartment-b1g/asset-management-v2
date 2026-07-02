# Next.js + Supabase Starter Template

A full-stack starter template with **Next.js 16**, **TypeScript**, **Prisma 7**, **local Supabase (Docker)**, **Redux Toolkit**, and **OpenAPI/Swagger** docs. Clone this repo, update the schema and UI for your domain, and ship to **Vercel + Supabase Cloud** — no separate backend server required.

For a deep dive into layers, conventions, and how to add new CRUD resources, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**. For authentication and the Prisma vs RLS model, see **[docs/SECURITY.md](docs/SECURITY.md)**.

## Tech stack


| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Framework    | Next.js 16 (App Router)                    |
| Language     | TypeScript                                 |
| Styling      | Tailwind CSS v4                            |
| Database     | PostgreSQL via Supabase                    |
| ORM          | Prisma 7 (`@prisma/adapter-pg`)            |
| Client state | Redux Toolkit + React Redux                |
| Auth         | Supabase Auth (`@supabase/ssr`)              |
| API docs     | OpenAPI 3 + Swagger UI (`swagger-ui-dist`) |
| Deploy       | Vercel (app) + Supabase Cloud (database)   |




## Prerequisites

- **Node.js 20+**
- **Docker** (for local Supabase)
- **Supabase CLI** (run via `npx supabase`)



## Quick start

```bash
git clone <repo-url> my-new-project
cd my-new-project
npm install
cp .env.example .env
npx supabase start
npx prisma migrate dev
npx prisma generate
npm run dev
```

After `npx supabase start`, copy the local **API URL**, **anon key**, and **database URL** from the CLI output into your `.env` file. See [.env.example](.env.example) for the required variables.

### Auth

1. Open [http://localhost:3000/signup](http://localhost:3000/signup) — enter full name, email, and password
2. Or sign in at [http://localhost:3000/login](http://localhost:3000/login)
3. Auth goes through `POST /api/auth/signup` or `POST /api/auth/login` (creates `public.user` profile row)
4. `/categories` and `/api/categories` require a signed-in session; categories are scoped per user

### Local URLs


| Service            | URL                                                                    |
| ------------------ | ---------------------------------------------------------------------- |
| App                | [http://localhost:3000](http://localhost:3000)                         |
| Supabase Studio    | [http://127.0.0.1:54323](http://127.0.0.1:54323)                       |
| API docs (Swagger) | [http://localhost:3000/docs](http://localhost:3000/docs)               |
| OpenAPI JSON       | [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi) |




## Project structure

```
src/
├── app/                    # Routes + API route handlers
│   ├── api/categories/     # HTTP entry (GET/POST/PATCH/DELETE)
│   ├── categories/         # UI page
│   ├── login/            # Sign in
│   ├── signup/           # Sign up
│   └── docs/               # Swagger UI
├── server/                 # Backend logic (server-only)
│   ├── auth/               # Session helpers (requireAuthUser)
│   ├── controllers/        # Validation + HTTP responses (categories, auth)
│   ├── repositories/       # Prisma queries (categories, auth)
│   └── prisma/client.ts    # Prisma + pg adapter
├── components/             # React UI
│   ├── categories/         # Entity-specific UI (reference CRUD)
│   ├── common/             # Shared UI (AsyncStatus, LogoutButton, etc.)
│   └── providers/          # ReduxProvider
├── lib/supabase/           # Supabase Auth clients (browser, server)
├── lib/store/              # Redux store + slices (API calls in thunks)
└── generated/prisma/       # Prisma client output (do not edit)
prisma/schema.prisma        # Database schema
```

Full architecture guide: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

## Routes


| Route             | Purpose            |
| ----------------- | ------------------ |
| `/`               | Home links         |
| `/login`          | Sign in            |
| `/signup`         | Create account     |
| `/api/auth/login` | Sign in API        |
| `/api/auth/signup`| Create account API |
| `/categories`     | Categories CRUD UI (auth required) |
| `/docs`           | Swagger API docs   |
| `/api/categories` | REST API (auth required) |
| `/api/openapi`    | OpenAPI JSON spec  |




## Scripts


| Command                     | Purpose                        |
| --------------------------- | ------------------------------ |
| `npm run dev`               | Start dev server               |
| `npm run build`             | Production build               |
| `npm run start`             | Run production build locally   |
| `npx supabase start`        | Start local Postgres + Studio  |
| `npx supabase stop`         | Stop local Supabase            |
| `npx prisma migrate dev`    | Apply migrations (development) |
| `npx prisma migrate deploy` | Apply migrations (production)  |
| `npx prisma generate`       | Regenerate Prisma client       |




## Deployment (Vercel + Supabase Cloud)

You only need **two services** — no separate backend on eg. Render, DigitalOcean, or Hostinger.

1. Create a **Supabase Cloud** project and copy the production Postgres connection string.
2. Connect this repo to **Vercel** and deploy.
3. Set environment variables in Vercel:
  - `DATABASE_URL` — Supabase Cloud Postgres connection string
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
4. Run migrations against production once:
  ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
  ```

The deployed Next.js app serves both the UI and `/api/*` routes. Backend logic in `src/server/` runs inside Vercel — not as a separate service.

## Adding new resources

The `categories` module is the reference implementation for full CRUD. To add departments, employees, or any other entity, copy that pattern.

See **[Adding a new CRUD resource](docs/ARCHITECTURE.md#adding-a-new-crud-resource)** in the architecture guide.

## Cloning for a new project

When you fork or clone this repo for a new app:

1. Update app title/metadata in `src/app/layout.tsx` and `src/app/page.tsx`
2. Edit `prisma/schema.prisma` for your domain models
3. Run `npx prisma migrate dev` after schema changes
4. Copy the `categories` pattern for each new entity (backend + frontend + Redux slice)
5. Extend `src/lib/openapi.ts` with new API paths
6. Update `.env` locally and env vars on Vercel

